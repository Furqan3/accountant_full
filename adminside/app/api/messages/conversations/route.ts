import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get all orders that have messages, with the latest message info
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        order_id,
        message_text,
        created_at,
        read_by_admin,
        orders (
          id,
          user_id,
          amount,
          status,
          metadata,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json({
        error: 'Failed to fetch conversations',
        details: messagesError.message
      }, { status: 500 });
    }

    // Get unique user IDs from orders
    const userIds = [...new Set(messages?.map((m: any) => m.orders?.user_id).filter(Boolean))];

    console.log('📋 Fetching profiles for user IDs:', userIds);

    // Fetch all user data (auth.users has email, profiles might not)
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    }

    // Fetch profiles for additional info
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
    }

    console.log('✅ Fetched users and profiles');

    // Create a map of profiles for quick lookup
    const profileMap = new Map(
      profiles?.map((p: any) => [p.id, p]) || []
    );

    // Create a map of users (from auth) for email lookup
    const userMap = new Map(
      users?.users?.map((u: any) => [u.id, u]) || []
    );

    // Group messages by order_id and get the latest message for each order
    const conversationsMap = new Map<string, any>();

    messages?.forEach((message: any) => {
      const orderId = message.order_id;
      const order = message.orders;

      if (!order) return;

      if (!conversationsMap.has(orderId)) {
        conversationsMap.set(orderId, {
          orderId,
          order,
          latestMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages (not read by admin)
      if (!message.read_by_admin) {
        const conv = conversationsMap.get(orderId);
        if (conv) {
          conv.unreadCount += 1;
        }
      }
    });

    // Convert map to array and extract company names
    const conversations = Array.from(conversationsMap.values()).map((conv) => {
      let companyName = 'Unknown Company';
      let companyNumber = null;
      let services = [];

      try {
        // Try to parse metadata to get company name and services
        if (conv.order.metadata?.items) {
          const items = typeof conv.order.metadata.items === 'string'
            ? JSON.parse(conv.order.metadata.items)
            : conv.order.metadata.items;

          if (items && items.length > 0) {
            if (items[0].companyName) {
              companyName = items[0].companyName;
            }
            if (items[0].companyNumber) {
              companyNumber = items[0].companyNumber;
            }
            // Extract all services
            services = items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity || 1,
            }));
          }
        } else if (conv.order.metadata?.companyName) {
          companyName = conv.order.metadata.companyName;
        }
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }

      // Get user profile and auth user from the maps
      const userProfile = profileMap.get(conv.order.user_id);
      const authUser = userMap.get(conv.order.user_id);

      // Fallback: full_name -> email -> 'Unknown User'
      const userName = userProfile?.full_name || authUser?.email || 'Unknown User';

      return {
        id: conv.orderId,
        name: userName, // Show user name as the conversation name
        companyName, // Keep company name separate
        lastMessage: conv.latestMessage.message_text || 'Attachment',
        timestamp: new Date(conv.latestMessage.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        unread: conv.unreadCount,
        orderDetails: {
          orderId: conv.orderId,
          amount: conv.order.amount,
          status: conv.order.status,
          created_at: conv.order.created_at,
          companyName,
          companyNumber,
          services,
        },
        user: authUser ? {
          name: userProfile?.full_name || authUser.email,
          email: authUser.email,
        } : null,
      };
    });

    // Sort by latest message timestamp
    conversations.sort((a, b) => {
      const aTime = conversationsMap.get(a.id)?.latestMessage.created_at || 0;
      const bTime = conversationsMap.get(b.id)?.latestMessage.created_at || 0;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({
      conversations,
      total: conversations.length,
    });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversations',
      details: error.message
    }, { status: 500 });
  }
}
