import { Calendar } from "lucide-react";
import ProductPage from "../ProductPage";
export const metadata = { title: "Studio Manager \ — Fotiqo", description: "Bookings, contracts, invoices, CRM \ — run your photography business from one dashboard." };
export default function Page() {
  return <ProductPage icon={<Calendar className="h-4 w-4" />} badge="Studio Manager" headline="Run your business from one dashboard" subheadline="22 booking packages, contracts with e-signatures, invoices, client CRM, availability calendar, and revenue analytics." color="from-gold-500 to-gold-400" features={[
    { title: "Booking packages", description: "Create 22+ packages with duration, deliverables, pricing, and add-ons. Clients book and pay instantly." },
    { title: "Contracts & e-signatures", description: "5 templates (wedding, portrait, event, commercial, mini session). Clients sign online with legal proof." },
    { title: "Invoices", description: "Create, send, and track invoices. See paid, pending, and overdue at a glance." },
    { title: "Client CRM", description: "Track every client: contact info, session history, total spend, notes. All in one place." },
    { title: "Availability calendar", description: "Set working hours, block dates, manage your schedule from the dashboard." },
    { title: "Revenue analytics", description: "Monthly revenue chart, per-gallery breakdown, conversion rates, and financial reporting." },
  ]} highlights={["22 booking packages", "Contracts with e-signatures", "5 contract templates included", "Invoice creation and tracking", "Client CRM with spend history", "Availability calendar", "Revenue analytics dashboard", "Automated email reminders", "Instant Stripe payments", "Deposit collection at booking"]} ctaText="Manage your studio free" />;
}
