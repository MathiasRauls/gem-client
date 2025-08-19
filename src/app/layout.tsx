import "@/styles/globals.css";
import type { Metadata } from "next";
import { sfPro } from './fonts/fontbook';
import { APP_NAME, APP_DESC, APP_URL } from '@/lib/const/index';

export const metadata: Metadata = {
	title: {
		template: `%s ${APP_NAME}`,
		default: APP_NAME
	},
	description: APP_DESC,
	metadataBase: new URL(APP_URL)
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${sfPro.variable} ${sfPro.variable} antialiased`}
			>
				{children}
			</body>
		</html>
	);
}
