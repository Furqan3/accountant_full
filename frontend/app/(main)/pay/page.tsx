"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Building2, Hash, ShoppingCart, Loader2, AlertCircle, CheckCircle, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";

interface Company {
  id: string;
  company_number: string;
  company_name: string;
  company_status?: string;
  company_type?: string;
  confirmation_statement_due?: string;
  accounts_due?: string;
}

interface Service {
  id: string;
  title: string;
  description?: string;
  slug: string;
  category?: string;
  base_price: number;
}

function PayPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, items: cartItems, removeFromCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  const [company, setCompany] = useState<Company | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [paidOrderId, setPaidOrderId] = useState<string | null>(null);

  const companyId = searchParams.get("company");
  const serviceId = searchParams.get("service");

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId || !serviceId) {
        setError("Missing company or service information");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch company and service data in parallel
        const [companyRes, serviceRes] = await Promise.all([
          fetch(`/api/companies/${companyId}`),
          fetch(`/api/services/${serviceId}`),
        ]);

        if (!companyRes.ok) {
          throw new Error("Company not found");
        }

        if (!serviceRes.ok) {
          throw new Error("Service not found");
        }

        const companyData = await companyRes.json();
        const serviceData = await serviceRes.json();

        if (!companyData.company) {
          throw new Error("Company data not available");
        }

        if (!serviceData.service) {
          throw new Error("Service data not available");
        }

        setCompany(companyData.company);
        setService(serviceData.service);

        // Check if this service has already been paid
        if (user) {
          try {
            const ordersRes = await fetch("/api/orders");
            if (ordersRes.ok) {
              const ordersData = await ordersRes.json();

              // Check if any paid order exists for this company + service combo
              // Service ID format: company_number-service_title
              const expectedServiceId = `${companyData.company.company_number}-${serviceData.service.title}`;

              const existingOrder = ordersData.orders?.find((order: any) => {
                const items = order.metadata?.items ? JSON.parse(order.metadata.items) : order.items || [];
                return (
                  order.payment_status === "paid" &&
                  items.some((item: any) => {
                    // Check both ID formats for backward compatibility
                    const matchesId = item.id === expectedServiceId || item.id === serviceData.service.id;
                    const matchesCompany = item.companyNumber === companyId || order.company_id === companyData.company.id;
                    return matchesId && matchesCompany;
                  })
                );
              });

              if (existingOrder) {
                setIsPaid(true);
                setPaidOrderId(existingOrder.id);
              }
            }
          } catch (orderErr) {
            console.error("Error checking order status:", orderErr);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load payment information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, serviceId, user]);

  // Clean up any duplicate entries in cart on mount
  useEffect(() => {
    if (company && service && cartItems.length > 0) {
      const correctServiceId = `${company.company_number}-${service.title}`;

      // Find and remove any legacy UUID-based duplicates
      cartItems.forEach(item => {
        if (
          item.title === service.title &&
          item.companyNumber === company.company_number &&
          item.id !== correctServiceId
        ) {
          console.log(`Removing duplicate legacy cart item: ${item.id}`);
          removeFromCart(item.id);
          toast.info("Removed duplicate service from cart");
        }
      });
    }
  }, [company, service, cartItems, removeFromCart]);

  const handleAddToCartAndCheckout = () => {
    if (!company || !service) return;

    // Use same ID format as company page: company_number-service_title
    const serviceId = `${company.company_number}-${service.title}`;

    // Remove any old UUID-based duplicate entries for this service
    cartItems.forEach(item => {
      // If same title and company but different ID (old UUID format), remove it
      if (
        item.title === service.title &&
        item.companyNumber === company.company_number &&
        item.id !== serviceId
      ) {
        removeFromCart(item.id);
      }
    });

    addToCart({
      id: serviceId,
      title: service.title,
      description: service.description,
      price: parseFloat(service.base_price.toString()),
      companyName: company.company_name,
      companyNumber: company.company_number,
    });

    toast.success("Service added to cart!");

    // Redirect to checkout
    setTimeout(() => {
      router.push("/checkout");
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading payment information...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !company || !service) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl p-8 border border-red-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Payment Error</h1>
            </div>
            <p className="text-gray-600 mb-6">
              {error || "Unable to load payment information"}
            </p>
            <button
              onClick={() => router.push("/company-search")}
              className="w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition"
            >
              Search for Companies
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 w-full">
        <div className="w-full px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Quick Payment
            </h1>
            <p className="text-gray-600">
              Review the service details and proceed to checkout
            </p>
          </div>

          <section className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Company Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  Company Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-6 w-6 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {company.company_name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <Hash className="h-3 w-3" />
                        <span>{company.company_number}</span>
                      </div>
                    </div>
                  </div>

                  {company.company_status && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`text-sm px-3 py-1 rounded-full font-medium ${
                          company.company_status.toLowerCase() === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {company.company_status}
                      </span>
                    </div>
                  )}

                  {company.company_type && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Type:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {company.company_type}
                      </span>
                    </div>
                  )}

                  {company.confirmation_statement_due && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Confirmation Statement Due:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatDate(company.confirmation_statement_due)}
                      </span>
                    </div>
                  )}

                  {company.accounts_due && (
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <span className="text-sm text-gray-600">Accounts Due:</span>
                      <span className="text-sm text-gray-900 font-medium">
                        {formatDate(company.accounts_due)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  Service Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {service.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded-full border border-teal-200">
                        {service.category}
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="text-2xl font-bold text-teal-600">
                        {formatPrice(service.base_price)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isPaid ? (
              <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-sm">
                <div className="flex flex-col items-center justify-center gap-4 text-center">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                  <div>
                    <h3 className="font-bold text-gray-900 text-xl mb-2">Already Paid!</h3>
                    <p className="text-gray-700 mb-4">
                      This service has already been purchased and paid for.
                    </p>
                    <Link
                      href={`/orders`}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium hover:underline"
                    >
                      View Your Orders →
                    </Link>
                  </div>
                </div>
              </div>
            ) : !user ? (
              <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Login Required</h3>
                    <p className="text-sm text-gray-700">
                      Please sign in to add this service to your cart and proceed with payment
                    </p>
                  </div>
                  <Link
                    href={`/signin?redirect=${encodeURIComponent(`/pay?company=${companyId}&service=${serviceId}`)}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-md"
                  >
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border-2 border-teal-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">Ready to proceed?</h3>
                    <p className="text-sm text-gray-700">
                      Add this service to your cart and complete the payment
                    </p>
                  </div>
                  <button
                    onClick={handleAddToCartAndCheckout}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-teal-700 transition shadow-md"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Checkout
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            {!isPaid && user && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Need to add more services?{" "}
                  <button
                    onClick={() => {
                      // Add current service to cart with consistent ID format
                      if (service && company) {
                        const serviceId = `${company.company_number}-${service.title}`;
                        addToCart({
                          id: serviceId,
                          title: service.title,
                          description: service.description,
                          price: parseFloat(service.base_price.toString()),
                          companyName: company.company_name,
                          companyNumber: company.company_number,
                        });
                        toast.success(`${service.title} added to cart!`);
                      }
                      // Navigate to company page
                      router.push(`/company/${companyId}`);
                    }}
                    className="text-teal-600 hover:text-teal-700 hover:underline font-medium"
                  >
                    View all services for this company
                  </button>
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
          </div>
          <Footer />
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  );
}
