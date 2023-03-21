<script>
	import '../app.postcss';
	import '@fontsource/inter/300.css';
	import '@fontsource/inter';
	import '@fontsource/inter/500.css';
	import '@fontsource/inter/600.css';
	import '@fontsource/inter/800.css';

	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<slot />
