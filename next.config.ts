import type { NextConfig } from "next";
import { APP_ENV } from '@/lib/const';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [new URL('http://127.0.0.1:8000/media/**')],
	},
	transpilePackages: ['three'],

	// Todo Prod Config File https://github.com/vercel/next.js/discussions/64964
	turbopack: {
		rules: {
			'*.glsl': {
				loaders: ['raw-loader'],
				as: '*.ts',
			},
		},
	},
};

export default nextConfig;