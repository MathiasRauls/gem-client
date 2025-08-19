export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<>
			{/* Todo: <header></header> */}
			<main className=''>
				{children}
			</main>
		</>
	);
}