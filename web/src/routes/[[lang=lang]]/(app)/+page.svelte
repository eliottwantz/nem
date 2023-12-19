<script lang="ts">
	import { langParams } from '$i18n'
	import { route } from '$lib/ROUTES'
	import ImageNem from '$lib/icons/ImageNEM.svelte'
	import StudentIcon from '$lib/icons/StudentIcon.svelte'
	import TeacherIcon from '$lib/icons/TeacherIcon.svelte'
	import { LucideBadgeCheck, LucideGlobe } from 'lucide-svelte'
</script>

<div
	class="container relative mx-auto flex h-[100svh] grid-rows-[auto_1fr] flex-col items-center px-4 pb-2 pt-4 lg:px-10"
>
	<h1 class="my-12 text-center text-3xl font-medium sm:text-6xl">Notre Education Moderne</h1>
	<div class="grid items-center justify-center gap-y-8 text-center lg:grid-cols-2 lg:gap-x-16">
		<div class="flex flex-col space-y-6 lg:space-y-16">
			<h1 class="h1">Your access to an education without borders.</h1>
			<h4 class="h3">
				Improve and develop your skills with thousands of teachers, or become a NEM Agent
			</h4>
			<a
				href={route('/signin', langParams())}
				role="button"
				class="variant-filled-primary btn self-center text-2xl"
			>
				Get your NEM Pass
			</a>
		</div>
		<div class="sm:flex sm:justify-center">
			<ImageNem />
		</div>
	</div>

	<div
		class="mt-12 grid grid-rows-2 gap-y-2 sm:mt-24 sm:gap-y-4 md:grid-cols-3 md:grid-rows-1 md:space-x-4 md:space-y-0"
	>
		<div class="flex flex-col items-center gap-y-1 sm:gap-y-4">
			<img
				src="/students-group.svg"
				alt="students talking in class"
				class="h-10 w-10 sm:h-16 sm:w-16"
			/>
			<p class="h2 text-center">Collaborative classes</p>
			<p class="h4 break-before-right text-center">
				Classes of 1 to 4 students improving communication
			</p>
		</div>
		<div class="flex flex-col items-center gap-y-1 sm:gap-y-4">
			<LucideBadgeCheck class="h-10 w-10 sm:h-16 sm:w-16" />
			<p class="h2 text-center">Qualified teachers</p>
			<p class="h4 break-before-right text-center">
				Unique teaching methods that encourage learning
			</p>
		</div>
		<div class="flex flex-col items-center gap-y-1 sm:gap-y-4">
			<LucideGlobe class="h-10 w-10 sm:h-16 sm:w-16" />
			<p class="h2 text-center">Without borders</p>
			<p class="h4 break-before-right text-center">Attend a course wherever you are</p>
		</div>
	</div>

	<div class="mt-12 grid grid-rows-2 gap-y-12 lg:grid-rows-[auto_1fr]">
		<div class="hidden gap-x-4 lg:flex">
			<div
				class="card w-full max-w-md space-y-4 border-4 border-surface-500/40 bg-gradient-to-b from-secondary-500 to-secondary-700 p-2 shadow-xl"
			>
				<div class="flex items-center justify-center">
					<StudentIcon />
					<p class="h3">You want to learn</p>
				</div>
				<p class="break-before-right text-center">
					Book your first class now and we'll handle the rest.
				</p>
			</div>
			<div
				class="card w-full max-w-md space-y-4 border-4 border-surface-500/40 bg-gradient-to-b from-secondary-500 to-secondary-700 p-2 shadow-xl"
			>
				<div class="flex items-center justify-center">
					<TeacherIcon />
					<p class="h3">You want to teach</p>
				</div>
				<p class="break-before-right text-center">Become a NEM Agent now.</p>
			</div>
		</div>

		<div class="hidden justify-evenly gap-x-4 lg:flex">
			<img
				src="/good-faces-OnxkPklQ4YY-unsplash.jpg"
				alt="student at his desk"
				class="aspect-square h-80 w-80 rounded-[3rem] object-cover"
			/>
			<img
				src="/luca-nicoletti-dzbSQkqZzUw-unsplash.jpg"
				alt="teacher smiling at camera"
				class="aspect-square h-80 w-80 rounded-[3rem] object-cover"
			/>
		</div>

		<div class="flex flex-col items-center gap-y-4 sm:gap-y-12 lg:hidden">
			<div
				class="card w-full max-w-md space-y-4 border-4 border-surface-500/40 bg-gradient-to-b from-secondary-500 to-secondary-700 p-2 shadow-xl"
			>
				<div class="flex items-center justify-center">
					<StudentIcon />
					<p class="h3">You want to learn</p>
				</div>
				<p class="break-before-right text-center">
					Book your first class now and we'll handle the rest.
				</p>
			</div>

			<img
				src="/good-faces-OnxkPklQ4YY-unsplash.jpg"
				alt="student at his desk"
				class="aspect-square h-80 w-80 rounded-[3rem] object-cover"
			/>
		</div>
		<div class="flex flex-col items-center gap-y-4 sm:gap-y-12 lg:hidden">
			<div
				class="card w-full max-w-md space-y-4 border-4 border-surface-500/40 bg-gradient-to-b from-secondary-500 to-secondary-700 p-2 shadow-xl"
			>
				<div class="flex items-center justify-center">
					<TeacherIcon />
					<p class="h3">You want to teach</p>
				</div>
				<p class="break-before-right text-center">Become a NEM Agent now.</p>
			</div>

			<img
				src="/luca-nicoletti-dzbSQkqZzUw-unsplash.jpg"
				alt="teacher smiling at camera"
				class="aspect-square h-80 w-80 rounded-[3rem] object-cover"
			/>
		</div>
	</div>

	<div id="blob1" class="hidden lg:block">
		<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M27.6,-19.4C40,-15.2,57.2,-7.6,64,6.8C70.8,21.2,67.1,42.3,54.7,50.9C42.3,59.6,21.2,55.7,-0.2,55.9C-21.6,56.1,-43.2,60.4,-49,51.8C-54.8,43.2,-44.9,21.6,-44.8,0.1C-44.7,-21.4,-54.5,-42.8,-48.6,-47C-42.8,-51.3,-21.4,-38.3,-6.9,-31.4C7.6,-24.5,15.2,-23.6,27.6,-19.4Z"
				transform="translate(100 100)"
			/>
		</svg>
	</div>
	<div id="blob2" class="translate-x-6">
		<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M27.6,-19.4C40,-15.2,57.2,-7.6,64,6.8C70.8,21.2,67.1,42.3,54.7,50.9C42.3,59.6,21.2,55.7,-0.2,55.9C-21.6,56.1,-43.2,60.4,-49,51.8C-54.8,43.2,-44.9,21.6,-44.8,0.1C-44.7,-21.4,-54.5,-42.8,-48.6,-47C-42.8,-51.3,-21.4,-38.3,-6.9,-31.4C7.6,-24.5,15.2,-23.6,27.6,-19.4Z"
				transform="translate(100 100)"
			/>
		</svg>
	</div>
</div>

<!-- For the blobs: https://www.blobmaker.app/ -->
<style lang="postcss">
	#blob1 {
		@apply fill-secondary-500;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 24rem;
		height: 24rem;
		z-index: 1000;
		pointer-events: none;
		mix-blend-mode: multiply;
		/* opacity: 0.3; */
		/* filter: blur(100px); */
		translate: -50% 10%;
	}
	#blob2 {
		@apply fill-primary-500;
		position: absolute;
		top: 0;
		right: 0;
		width: 24rem;
		height: 24rem;
		z-index: 1000;
		pointer-events: none;
		mix-blend-mode: multiply;
		/* filter: blur(100px); */
		translate: 50% -40%;
	}
</style>
