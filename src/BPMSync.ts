type BPMChangeCallback = (bpm: number) => void
type SyncChangeCallback = (sync: boolean) => void

export class BPMSync {
  private bpm: number
  private sync: boolean

  private readonly bpmChangeCallbacks: BPMChangeCallback[] = []
  private readonly syncChangeCallbacks: SyncChangeCallback[] = []

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

  public getBPM(): number {
    return this.bpm
  }

  public getSync(): boolean {
    return this.sync
  }

  public setBPM(bpm: number): void {
    if (this.bpm !== bpm) {
      this.bpm = bpm

      for (const callback of this.bpmChangeCallbacks) {
        callback(this.bpm)
      }
    }
  }

  public setSync(sync: boolean): void {
    if (this.sync !== sync) {
      this.sync = sync

      for (const callback of this.syncChangeCallbacks) {
        callback(this.sync)
      }
    }
  }

  public onBPMChange(bpmChangeCallback: BPMChangeCallback): void {
    this.bpmChangeCallbacks.push(bpmChangeCallback)
  }

  public onSyncChange(syncChangeCallback: SyncChangeCallback): void {
    this.syncChangeCallbacks.push(syncChangeCallback)
  }

  public offBPMChange(bpmChangeCallback: BPMChangeCallback): void {
    this.bpmChangeCallbacks.splice(
      0,
      this.bpmChangeCallbacks.length,
      ...this.bpmChangeCallbacks.filter(
        (callback: BPMChangeCallback): boolean =>
          callback !== bpmChangeCallback,
      ),
    )
  }

  public offSyncChange(syncChangeCallback: SyncChangeCallback): void {
    this.syncChangeCallbacks.splice(
      0,
      this.syncChangeCallbacks.length,
      ...this.syncChangeCallbacks.filter(
        (callback: SyncChangeCallback): boolean =>
          callback !== syncChangeCallback,
      ),
    )
  }
}
