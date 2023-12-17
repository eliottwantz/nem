<div class="space-y-0.5 px-2 pt-2 md:px-10 md:pt-10">
	<div class="text-3xl font-bold tracking-tight">
		<slot name="title" />
	</div>
	<div class="text-muted">
		<slot name="subtitle" />
	</div>
	<hr class="divider" />
</div>
<div id="main" class="container mx-auto flex h-full w-full flex-col p-2 md:p-10">
	<slot />
</div>
