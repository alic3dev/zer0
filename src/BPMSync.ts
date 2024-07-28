type BPMChangeCallback = (bpm: number) => void
type SyncChangeCallback = (sync: boolean) => void

export class BPMSync {
  private bpm: number
  private sync: boolean

  private bpmChangeCallbacks: BPMChangeCallback[] = []
  private syncChangeCallbacks: SyncChangeCallback[] = []

  constructor({
    bpm = 270,
    sync = true,
    onBPMChange,
    onSyncChange,
  }: {
    bpm?: number
    sync?: boolean
    onBPMChange?: BPMChangeCallback
    onSyncChange?: SyncChangeCallback
  }) {
    this.bpm = bpm
    this.sync = sync

    if (onBPMChange) {
      this.bpmChangeCallbacks.push(onBPMChange)
    }

    if (onSyncChange) {
      this.syncChangeCallbacks.push(onSyncChange)
    }
  }

  public getUsableBPM(): number {
    return this.getSync() ? this.getBPM() : 60
  }

  getBPM(): number {
    return this.bpm
  }

  getSync(): boolean {
    return this.sync
  }

  setBPM(bpm: number): void {
    if (this.bpm !== bpm) {
      this.bpm = bpm

      for (const callback of this.bpmChangeCallbacks) {
        callback(this.bpm)
      }
    }
  }

  setSync(sync: boolean): void {
    if (this.sync !== sync) {
      this.sync = sync

      for (const callback of this.syncChangeCallbacks) {
        callback(this.sync)
      }
    }
  }

  onBPMChange(bpmChangeCallback: BPMChangeCallback): void {
    this.bpmChangeCallbacks.push(bpmChangeCallback)
  }

  onSyncChange(syncChangeCallback: SyncChangeCallback): void {
    this.syncChangeCallbacks.push(syncChangeCallback)
  }

  offBPMChange(bpmChangeCallback: BPMChangeCallback): void {
    this.bpmChangeCallbacks = this.bpmChangeCallbacks.filter(
      (callback: BPMChangeCallback): boolean => callback !== bpmChangeCallback,
    )
  }

  offSyncChange(syncChangeCallback: SyncChangeCallback): void {
    this.syncChangeCallbacks = this.syncChangeCallbacks.filter(
      (callback: SyncChangeCallback): boolean =>
        callback !== syncChangeCallback,
    )
  }
}
