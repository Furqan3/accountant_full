// app/layout.tsx
"use client"
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { SocketProvider } from "@/context/socket-context";
import { CartProvider } from "@/context/cart-context";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { ToastContainer } from "react-toastify"
import { MessageNotificationListener } from "@/components/notifications/message-notification"
import "react-toastify/dist/ReactToastify.css"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <AuthProvider>
          <SocketProvider>
            <MessageNotificationListener />
            <CartProvider>
              <Elements stripe={stripePromise}>
                {children}
                <ToastContainer position="bottom-right" />
              </Elements>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

