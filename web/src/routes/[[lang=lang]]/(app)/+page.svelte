<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import Layout from '$lib/components/Layout.svelte'
	import ImageNem from '$lib/icons/ImageNEM.svelte'
</script>

<Layout>
	<div class="container mx-auto flex flex-col items-center space-y-4 px-4 pb-2 pt-4 lg:px-10">
		<div
			class=" grid items-center gap-y-8 text-center lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-x-16"
		>
			<div class="flex flex-col space-y-6 lg:space-y-16">
				<h2 class="h2">Notre Education Moderne</h2>
				<h1 class="h1">NEM Pass, your access to an education without borders.</h1>
				<h4 class="h3">Improve and develop your skills</h4>
				<a
					href={route('/signin', langParams())}
					role="button"
					class="variant-filled-primary btn self-center"
				>
					Get your NEM Pass
				</a>
			</div>
			<div class="flex justify-center">
				<ImageNem />
			</div>
		</div>

		<!-- <div id="blob1">
			<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M27.6,-19.4C40,-15.2,57.2,-7.6,64,6.8C70.8,21.2,67.1,42.3,54.7,50.9C42.3,59.6,21.2,55.7,-0.2,55.9C-21.6,56.1,-43.2,60.4,-49,51.8C-54.8,43.2,-44.9,21.6,-44.8,0.1C-44.7,-21.4,-54.5,-42.8,-48.6,-47C-42.8,-51.3,-21.4,-38.3,-6.9,-31.4C7.6,-24.5,15.2,-23.6,27.6,-19.4Z"
					transform="translate(100 100)"
				/>
			</svg>
		</div> -->
	</div>
</Layout>

<!-- For the blobs: https://www.blobmaker.app/ -->
<!-- <style lang="postcss">
	#blob1 {
		@apply fill-secondary-500;
		/* position: absolute; */
		/* top: 0; */
		/* left: 0; */
		width: 100%;
		height: 100%;
		z-index: 1000;
		pointer-events: none;
		mix-blend-mode: multiply;
		/* opacity: 0.3; */
		/* filter: blur(100px); */
		/* transform: translate(-50%, -50%); */
	}
</style> -->
