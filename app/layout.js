import "./globals.css";
import Providers from "../components/Providers";

export const metadata = {
  title: "XamusiceL",
  description: "Search, save and share music — XamusiceL"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
