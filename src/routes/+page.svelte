<script lang="ts">
	import { SvelteDate } from 'svelte/reactivity';

	let pflegegeldMap = new Map<string, number>([
		['PG1', 0],
		['PG2', 347],
		['PG3', 599],
		['PG4', 800],
		['PG5', 990]
	]);
	let pflegegrad = $state('');

	let gemeinsamerJahresbetrag = $state(3539);

	let kurzzeitpflegeTage = $state(56);
	let verhinderungspflegeTage = $state(56);

	let beginnString = $state('');
	let endeString = $state('');

	let rechnungsbetrag = $state(0);

	let leistungsart = $state('');

	let beginnDate = $derived(beginnString ? new SvelteDate(beginnString) : new SvelteDate());
	let endeDate = $derived(endeString ? new SvelteDate(endeString) : new SvelteDate());

	let zeitraum = $derived((endeDate.getTime() - beginnDate.getTime()) / (1000 * 60 * 60 * 24));

	let tagessatz = $derived(rechnungsbetrag / zeitraum);

	let tageAusgeschoepft = $derived(
		leistungsart == 'VHP' ? zeitraum > verhinderungspflegeTage : zeitraum > kurzzeitpflegeTage
	);

	let budgetAusgeschoepft = $derived(rechnungsbetrag > gemeinsamerJahresbetrag);

	let erstattungsbetrag = $derived(
		ermittleErstattungsbetrag(
			rechnungsbetrag,
			tagessatz,
			leistungsart,
			tageAusgeschoepft,
			budgetAusgeschoepft
		)
	);
	let erstattungszeitraum = $derived(
		ermittleErstattungszeitraum(erstattungsbetrag, tagessatz, leistungsart)
	);

	let gemeinsamerJahresbetragRest = $derived(gemeinsamerJahresbetrag - erstattungsbetrag);

	let kurzzeitpflegeTageRest = $derived(
		leistungsart == 'KZP' ? kurzzeitpflegeTage - erstattungszeitraum : kurzzeitpflegeTage
	);

	let verhinderungspflegeTageRest = $derived(
		leistungsart == 'VHP' ? verhinderungspflegeTage - erstattungszeitraum : verhinderungspflegeTage
	);

	let pflegegeld = $derived(ermittlePflegegeld(pflegegrad, erstattungszeitraum).toFixed(2));

	function ermittleErstattungsbetrag(
		rechnungsbetrag: number,
		tagessatz: number,
		leistungsart: string,
		tageAusgeschoepft: boolean,
		budgetAusgeschoepft: boolean
	): number {
		if (tageAusgeschoepft) {
			let betragNachTagen =
				leistungsart == 'VHP'
					? verhinderungspflegeTage * tagessatz
					: kurzzeitpflegeTage * tagessatz;
			return betragNachTagen > gemeinsamerJahresbetrag ? gemeinsamerJahresbetrag : betragNachTagen;
		} else if (budgetAusgeschoepft) {
			return gemeinsamerJahresbetrag;
		} else {
			return rechnungsbetrag;
		}
	}

	function ermittleErstattungszeitraum(
		erstattungsbetrag: number,
		tagessatz: number,
		leistungsart: string
	): number {
		if (erstattungsbetrag > 0) {
			return erstattungsbetrag / tagessatz;
		}
		return 0;
	}

	function ermittlePflegegeld(pflegegrad: string, erstattungszeitraum: number): number {
		let pflegegeldAnspruch = pflegegeldMap.get(pflegegrad);

		if (pflegegeldAnspruch != undefined) {
			if (erstattungszeitraum > 0) {
				return (pflegegeldAnspruch / 30) * erstattungszeitraum * 0.5;
			} else {
				return pflegegeldAnspruch;
			}
		} else {
			return 0;
		}
	}
</script>

<div class="grid w-full grid-cols-2 gap-2">
	<div class="card col-span-2 border-2 p-6">
		<form>
			<select class="select" bind:value={pflegegrad}>
				<option value="PG1">Pflegegrad 1</option>
				<option value="PG2">Pflegegrad 2</option>
				<option value="PG3">Pflegegrad 3</option>
				<option value="PG4">Pflegegrad 4</option>
				<option value="PG5">Pflegegrad 5</option>
			</select>
		</form>
	</div>

	<div id="input" class="card border-2 p-6">
		<!--TODO: Grid verwenden-->
		<form class="grid grid-cols-2 gap-4">
			<div class="card col-span-2">
				<label class="label" for="restbetrag">Verfügbarer gemeinsamer Jahresbetrag</label>
				<input class="input" bind:value={gemeinsamerJahresbetrag} />
			</div>
			<div>
				<label class="label" for="restbetrag">Restanspruch Tage Kurzzeitpflege</label>
				<input class="input" bind:value={kurzzeitpflegeTage} />
			</div>
			<div>
				<label class="label" for="restbetrag">Restanspruch Tage Verhinderungspflege</label>
				<input class="input" bind:value={verhinderungspflegeTage} />
			</div>
			<div class="card col-span-2">
				<label class="label" for="leistungsart">Leistungsart</label>
				<select id="leistungsart" class="select" bind:value={leistungsart}>
					<option value="VHP">Verhinderungspflege</option>
					<option value="KZP">Kurzzeitpflege</option>
				</select>
			</div>
			<div class="card">
				<label class="label" for="beginn">Beginn</label>
				<input class="input" type="date" bind:value={beginnString} />
			</div>
			<div class="card">
				<label class="label" for="ende">Ende</label>
				<input class="input" type="date" bind:value={endeString} />
			</div>
			<div class="card col-span-2">
				<label class="label" for="rechnungsbetrag">Rechnungsbetrag</label>
				<input class="input" bind:value={rechnungsbetrag} />
			</div>
		</form>
	</div>

	<div id="result" class="card grid grid-cols-2 gap-4 border-2 p-6">
		<div class="card col-span-2">
			<div class="label">Restanspruch gemeinsamer Jahresbetrag</div>
			<div class="input">{gemeinsamerJahresbetragRest} €</div>
		</div>
		<div class="card">
			<div class="label">Restanspruch Kurzzeitpflege</div>
			<div class="input">{kurzzeitpflegeTageRest} Tage</div>
		</div>
		<div class="card">
			<div class="label">Restanspruch Verhinderungspflege</div>
			<div class="input">{verhinderungspflegeTageRest} Tage</div>
		</div>

		<div class="card">
			<div class="label">Behandlungszeitraum</div>
			<div class="input">{zeitraum.toFixed(0)} Tage</div>
		</div>

		<div class="card">
			<div class="label">Erstattungszeitraum</div>
			<div class="input">{erstattungszeitraum} Tage</div>
		</div>

		<div class="card">
			<div class="label">Erstattungsbetrag</div>
			<div class="input">{erstattungsbetrag} €</div>
		</div>
	</div>

	<div class="card col-span-2 border-2 p-6">
		<div class="card">
			<div class="label">Pflegegeld</div>
			<div class="input">{pflegegeld} €</div>
		</div>
	</div>
</div>
