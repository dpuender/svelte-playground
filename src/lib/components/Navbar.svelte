<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex w-full gap-1 p-2">
	<div class="card flex w-30 items-center justify-center border-2">ICON</div>
	<nav class="card w-full border-2">
		<ul class="flex items-center justify-center gap-2 p-2">
			<li class="card w-30 border-2" class:active={page.url.pathname === '/'}>
				<a class="flex h-full w-full items-center justify-center p-2" href="/">Start</a>
			</li>
			<li class="card w-30 border-2" class:active={page.url.pathname === '/pflegegeld'}>
				<a class="flex h-full w-full items-center justify-center p-2" href="pflegegeld"
					>Pflegegeld</a
				>
			</li>
			<li
				class="card w-30 border-2"
				class:active={page.url.pathname === '/gemeinsamerjahresbetrag'}
			>
				<a class="flex h-full w-full items-center justify-center p-2" href="gemeinsamerjahresbetrag"
					>Jahresbetrag</a
				>
			</li>
		</ul>
	</nav>
</div>

<style>
	li {
		transition: all 0.2s ease-in-out;
	}
	li:hover {
		transform: scale(1.05) translateY(-2px);
		box-shadow:
			0 4px 6px -1px rgb(0 0 0 / 0.1),
			0 2px 4px -2px rgb(0 0 0 / 0.1);
	}
	.active {
		background-color: #203357;
		border-color: #03897d;
	}
</style>
