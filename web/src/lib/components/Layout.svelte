<div class="space-y-0.5 px-2 pt-2 md:px-10 md:pt-10">
	<div class="text-2xl font-bold tracking-tight sm:text-3xl">
		<slot name="title" />
	</div>
	<div class="text-muted">
		<slot name="subtitle" />
	</div>
	<hr class="divider" />
</div>
<div id="main" class="mx-auto h-full w-full p-2 md:p-10">
	<slot />
</div>
