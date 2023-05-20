export class MeaningLeaf {
    val = ``;
    labels = [];
    notes = [];
    toString() {
        return `{val: ${this.val}, lbl.: ${this.labels}, nt.: ${this.notes}}`;
    }
}
