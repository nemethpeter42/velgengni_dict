export class MeaningLeaf {
	val: string = ``;
	labels: string[] = [];
	notes: string[] = [];
	toString(): string {
		return `{val: ${this.val}, lbl.: ${this.labels}, nt.: ${this.notes}}`
	}
}
