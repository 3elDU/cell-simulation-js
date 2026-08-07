# taint cells

cell can be tainted with a color, which will be shown in the cell renderer. the color will be applied
to all cell descendants, but with a slight change, when mutation occurs.

# rollback slider

a slider that allows to roll back the simulation in time, saves every 100 ticks
with automatic cleaning to keep the total amount of snapshots in memory under 1000
by deleting snapshots in-between.

# better cell inspector

a reimagined cell inspector that's not just snowing the raw json, but providing
insight into how the cell operates - what

# hormones

an instruction to write hormone can either be an explicit action, or be implicitly
triggered as part of other actions.

hormones can be read like any other sensors. amount of hormones is evolvable.
