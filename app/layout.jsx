import ClientLayout from "./layout.client";

export const metadata = {
  title: "cinereserve",
  description: "Cinema Reservation System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}