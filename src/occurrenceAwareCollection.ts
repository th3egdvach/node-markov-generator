export class OccurrenceAwareCollection<TValue> {
	private values = new Map<TValue, OccurrenceInfoInternal>();

	private totalCount: number = 0;

	private shouldUpdateProbabilities: boolean = false;

	constructor(item?: TValue) {
		if (item) {
			this.add(item);
		}
	}

	public add(value: TValue): void {
		this.totalCount++;

		const existing = this.values.get(value);
		if (existing) {
			existing.numberOfOccurrences++;
		} else {
			this.values.set(value, { numberOfOccurrences: 1 });
		}

		this.shouldUpdateProbabilities = true;
	}

	public getRandom(): OccurrenceInfo<TValue> {
		this.ensureProbabilitiesUpdated();

		const random = Math.random();
		let result: OccurrenceInfo<TValue> = null;

		for (const [value, occurenceInfo] of this.values.entries()) {
			if (occurenceInfo.intervalFrom <= random && random < occurenceInfo.intervalTo) {
				result = this.mapToOccurrenceInfo(value, occurenceInfo);
			}
		}

		return result;
	}

	private mapToOccurrenceInfo(value: TValue, x: OccurrenceInfoInternal): OccurrenceInfo<TValue> {
		return {
			value,
			numberOfOccurrences: x.numberOfOccurrences
		};
	}

	private ensureProbabilitiesUpdated(): void {
		if (!this.shouldUpdateProbabilities) {
			return;
		}

		const delta = 1 / this.totalCount;
		let lastBoundary = 0;

		for (const v of this.values.values()) {
			let newBoundary = lastBoundary + (delta * v.numberOfOccurrences);

			v.intervalFrom = lastBoundary;
			v.intervalTo = newBoundary;

			lastBoundary = newBoundary;
		}

		this.shouldUpdateProbabilities = false;
	}
}

export interface OccurrenceInfo<T> {
	value: T;
	numberOfOccurrences: number;
}

interface OccurrenceInfoInternal {
	numberOfOccurrences: number;
	intervalFrom?: number;
	intervalTo?: number;
}
