import { describe, it, expect } from "vitest";
import { sortSystems, type System } from "@/systems";
import { systemRegistry } from "@/systems/registry";
import { newWorld } from "@/world";

/**
 * These tests cover sortSystems against the real registry only.
 *
 * The implementation misbehaves on inputs the registry doesn't currently
 * produce (unknown dependency ids, empty `after` arrays, longer dependency
 * chains) — those cases are written up in TESTING-BUGS.md rather than pinned
 * here, so that fixing them doesn't require rewriting these tests.
 */

function index(systems: System[], id: string): number {
  return systems.findIndex((system) => system.id === id);
}

function realSystems(): System[] {
  return [...systemRegistry.list()].map((def) => def.create());
}

describe("sortSystems with the real registry", () => {
  it("keeps every system", () => {
    const systems = realSystems();
    const before = systems.map((system) => system.id).sort();

    sortSystems(systems);

    expect(systems.map((system) => system.id).sort()).toEqual(before);
  });

  it("sorts in place", () => {
    const systems = realSystems();

    expect(sortSystems(systems)).toBeUndefined();
    expect(systems).toHaveLength(7);
  });

  it("places sensors after both light and temperature", () => {
    const systems = realSystems();

    sortSystems(systems);

    expect(index(systems, "sensors")).toBeGreaterThan(index(systems, "light"));
    expect(index(systems, "sensors")).toBeGreaterThan(
      index(systems, "temperature")
    );
  });

  it("places genome after sensors", () => {
    const systems = realSystems();

    sortSystems(systems);

    expect(index(systems, "genome")).toBeGreaterThan(index(systems, "sensors"));
  });

  it("is not idempotent: re-sorting reshuffles the independent systems", () => {
    // Current behavior. The comparator returns -1 whenever `a` has no
    // dependencies regardless of `b`, so it isn't a valid ordering function
    // and an already-sorted array does not stay put. See TESTING-BUGS.md.
    const systems = realSystems();

    sortSystems(systems);
    const first = systems.map((system) => system.id);
    sortSystems(systems);

    expect(systems.map((system) => system.id)).not.toEqual(first);
  });

  it("still satisfies the dependency invariants after a second sort", () => {
    const systems = realSystems();

    sortSystems(systems);
    sortSystems(systems);

    expect(index(systems, "sensors")).toBeGreaterThan(index(systems, "light"));
    expect(index(systems, "sensors")).toBeGreaterThan(
      index(systems, "temperature")
    );
    expect(index(systems, "genome")).toBeGreaterThan(index(systems, "sensors"));
  });
});

describe("newWorld system order", () => {
  it("applies the same ordering to a freshly created world", () => {
    const world = newWorld(4, 4);

    expect(index(world.systems, "sensors")).toBeGreaterThan(
      index(world.systems, "light")
    );
    expect(index(world.systems, "sensors")).toBeGreaterThan(
      index(world.systems, "temperature")
    );
    expect(index(world.systems, "genome")).toBeGreaterThan(
      index(world.systems, "sensors")
    );
  });

  it("happens to place movement after the systems that produce its input", () => {
    // movement declares no `after`, yet genome and constant-move both write
    // the movement component it consumes. It lands last here only because of
    // how the (invalid) comparator shuffles dependency-free systems — it is
    // incidental, not guaranteed. Pinned so a change becomes visible.
    const world = newWorld(4, 4);

    expect(index(world.systems, "movement")).toBeGreaterThan(
      index(world.systems, "genome")
    );
    expect(index(world.systems, "movement")).toBeGreaterThan(
      index(world.systems, "sys-constant-move")
    );
  });
});
