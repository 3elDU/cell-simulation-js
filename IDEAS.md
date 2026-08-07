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

# improving metrics

- metric types other than graph based, like text
  - lists. example: most prevalent genome instructions: ["idle: 67%", "reproduction: 30%", ...] that will be rendered as a list in tweakpane
  - strings. simple string for one value
- when adding many graphs doesn't make sense, allow selects in graphs to filter out
  what exactly they are graphing

# genome

write for each action in genome, how many times it was choosed, useful for metrics.

# seasons

the light system is currently static. cells fill up the bottom side of the screen,
because that's where there is more light.

implement multiple independent modes, that can be turned on at once:
- flip gradient: smoothly flips gradient every X ticks. followed by Y ticks of peace
- seasons: controls the regrow rate as a fraction of global regrow rate. 
