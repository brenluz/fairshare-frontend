import { Component, computed, input } from '@angular/core';

/**
 * The FairShare mark: three rounded "balancing" bars on an accent square,
 * next to the wordmark. Pure CSS — no image asset (per the design handoff).
 */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
})
export class Logo {
  /** Square size in px. The design uses 46 on login, 40 on register, 38 on join. */
  size = input(46);

  /** Bars and wordmark scale with the square. */
  protected barWidth = computed(() => (this.size() >= 44 ? 5 : 4));
  protected barGap = computed(() => (this.size() >= 44 ? 3 : 2.5));
  protected radius = computed(() => Math.round(this.size() * 0.3));
  protected wordSize = computed(() => (this.size() >= 44 ? 22 : 19));

  // Short / tall / medium — the "balancing" silhouette.
  protected shortBar = computed(() => (this.size() >= 44 ? 12 : 10));
  protected tallBar = computed(() => (this.size() >= 44 ? 20 : 17));
  protected midBar = computed(() => (this.size() >= 44 ? 16 : 14));
}
