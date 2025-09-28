+++
date = '2025-09-14T18:02:58+05:30'
draft = false
title = 'The Fragile Elegance of Open Addressing'
description = 'What makes an array both powerful and brittle? Discover how open addressing pushes hash tables to their limits—where beauty meets the edge of performance collapse.'
keywords = ['hashmap', 'dictionary', 'array']
images = ['poster.avif']
categories = ['dsa']
tags = ['Data structures', 'Python']
math = true
+++
In the last article, we explored chaining, where collisions are resolved by attaching an external structure—typically a doubly linked list—to each bucket. This works, but it comes with a hidden cost. Linked lists scatter elements across the heap, turning each lookup into a sequence of random memory accesses. That destroys much of the performance advantage that arrays (or vectors) usually give us: tight, contiguous storage and cache efficiency.

Open addressing flips this philosophy on its head. Instead of pushing collisions outward into auxiliary structures, it insists that every key-value pair must live inside the array itself. No lists, no nodes, no extra indirection. At first glance, this seems elegant—one flat array, no messy pointers. Even better, the memory layout is cache-friendly, and linear scans often outperform linked structures despite doing “more work.”

But this internal simplicity comes with its own challenges. Once you commit to storing everything in the array, you now need careful strategies for:

- **Probing**: how to find the next open slot when a collision occurs.
- **Deletion**: how to remove elements without breaking probe chains (the infamous tombstone problem).
- **Load management**: how to keep the table from getting too crowded, since performance degrades rapidly as it fills.

In other words: open addressing hash tables offer elegance and speed in the best case, but force us to wrestle with subtleties in the worst.

<!--more-->
## Collision Handling Philosophy: Internal vs. External
At the heart of every hashmap lies the same tension: we have a vast key space—billions of possible inputs—yet only a fixed-size array to store them in. A hash function acts as the bridge:

\\[h: \mathcal{U} \to \\{0, 1, \dots, n-1\\}\\]

But since many keys may map to the same slot, collisions are inevitable. What differs between designs is how they resolve them.

- **Chaining (external resolution)**: When two keys collide, they share the same bucket by forming a linked list. It’s like an apartment where a second tenant can move in as a roommate. This keeps insertion simple—you can always tack on another node—but it scatters memory around, and searching through roommates is slower.
- **Open addressing (internal resolution)**: No roommates allowed. Every tenant must have their own apartment. If the intended unit is occupied, you start walking down the hall until you find the next available room. This keeps everyone inside the same building (the array), which is great for locality, but it means a crowded building quickly turns into a frustrating game of musical chairs.

This single design choice—external vs. internal resolution—sets the stage for everything else: how fast the table is under load, how deletions are handled, and what kinds of performance cliffs we must guard against.

---

## Storage and Cache Locality

The way collisions are handled doesn’t just affect correctness—it also shapes how data lives in memory, which in turn drives performance.

**Chaining (the “box set” method)**: Imagine you’re organizing your movie collection on a shelf alphabetically. Most titles fit neatly into their slots, but sometimes a new release bumps into an existing one. Instead of rearranging everything, you tuck the extra discs into a little box set sitting at that spot. Over time, certain letters—say “S” for *Spider-Man*, *Star Wars*, *Seven Samurai* — accumulate large box sets. To find Star Wars, you go to the “S” slot, then flip through the stack until you find the right case. This works fine, but notice the cost: movies in each box are scattered and harder to grab quickly. That’s what linked lists do in memory — jumping around the heap, paying the price in cache misses.

**Open addressing (the “single-shelf” method)**: Now imagine a stricter system: every movie must go directly on the shelf. No box sets, no overflow. If the right alphabetical slot is taken, you slide along to the next open space and place it there. All the movies stay neatly lined up, so flipping through nearby cases is fast. This is like contiguous arrays in memory — once a cache line is loaded, several neighbors come along “for free.” Even though you might need to scan past a few mismatches, the locality keeps performance high. 

But there’s a catch. The shelf only works smoothly when there’s plenty of room. As it fills, the gaps disappear, and searching for a spot becomes like hunting for a free seat in a packed theater. That’s why open addressing tables deliberately leave empty space—often operating at 50–70% capacity—to preserve fast probing.

So chaining is like having **box sets that sprawl beyond the shelf**—flexible but messy—while open addressing is like a **disciplined shelf where everything is inline**—fast and elegant, but requiring strict space management.

---

## Probing Strategies

The heart of open addressing lies in probing: what to do when a hash function points to an already-occupied slot. A probing strategy defines how we search for the next available cell—both when inserting and when looking up a value.

Choosing a poor strategy can be disastrous. Insertions may cascade into long probe sequences, and lookups degrade from 
\\(O(1)\\) expected time toward \\(O(n)\\). (Of course, both chaining and open addressing are sensitive to the quality of the hash function itself—but with open addressing, the probing rule makes or breaks the design.)


### Linear Probing
The simplest strategy: when a collision occurs, move one slot forward, then another, and so on until you find an empty space.
```python
if self._probing == 'linear':
    return i
```
{{< video webm="hashmap-linear-probe.webm" autoplay="true" loop="true" muted="true" >}}

It’s easy to understand and cache-friendly, since it keeps probes local. But it suffers from [primary clustering](https://en.wikipedia.org/wiki/Primary_clustering): once a run of occupied slots forms, it tends to grow. Any new key hashing into that area has to walk through the entire cluster, which slows down lookups and makes the cluster grow even more. Over time, clusters become hotspots that dominate performance.

### Quadratic Probing
Quadratic probing takes a different tack: instead of moving step by step, it jumps forward by a quadratic amount.

```python
if self._probing == 'quadratic':
    return i * i
```
The probe sequence looks like: +1, +4, +9, …

This eliminates **primary clustering**—keys hashing into the same region won’t necessarily pile up into one long run. Instead, collisions are spread more evenly across the table.

But quadratic probing has its own weakness: **secondary clustering**. Keys that initially hash to the same slot will still follow the same quadratic sequence, colliding with each other at every step. It’s better than linear probing under load, but not perfect. And it loses some of the locality advantage, since probes may jump farther across the array.

### Double Hashing 
The most sophisticated approach uses a second hash function to determine the step size:

```python
if self._probing == "double":
    step = self._secondary_hash(hash_key, self._size)
    if step == 0:
        step = 1
    return i * step
```

Here, the probe sequence looks like:
\\[ 
    h_1(k),  (h_1(k)\\,+\\,h_2(k)) \text{mod} \\,m,  (h_1(k)\\, +\\, 2 \cdot h_2(k)) \text{mod}\\, m,  …
\\]​
This gives each key its own *unique* probe sequence, minimizing both primary and secondary clustering. The only rules are:

1. \\(h_2(k)\\) must never be 0 (to avoid infinite loops).
2. \\(h_2(k)\\) should be independent of \\(h_1(k) \\)

A reasonable choice is:
\\[ 
    h_2(k)=1 \\, +\\,(k\\, \text{mod} \\,(m−2))
\\]

When the table size \\(m\\) is prime, this ensures the probe sequence will eventually cover the entire table. In practice, even with non-prime odd \\(m\\), this works well.

The tradeoff: double hashing requires computing two hash functions, which is more expensive. But in exchange, it gives the best distribution and the least clustering—making it the strategy of choice for performance-critical workloads

---

## Load Factor and Resizing

Unlike chaining, where a high load factor is tolerable because collisions just mean longer linked lists, open addressing degrades much faster as the table fills. Longer probe sequences increase the average lookup and insertion cost, and at 100% load the table cannot accept any new items without resizing.

In practice, open addressing tables keep the load factor below ~0.5–0.7. Once this threshold is breached, the table must grow and all entries must be rehashed into a larger array.

A common heuristic is to **double the size and add 1** (ensuring an odd number), which often helps distribute keys better across the new slots. Some implementations instead choose the next prime number to further reduce clustering.

In the implementation below, we check the load factor in `put`, and trigger `_resize` when the threshold exceeds 0.7. During resize, the table is rebuilt from scratch, skipping over both empty slots and tombstones:

```python
def _resize(self):
    """
    Doubles the size of the table and re-hashes all existing entries.
    Called when the load factor exceeds a threshold.
    """
    old_table = self._table
    self._size = self._size * 2 + 1  # Ensures odd size for better distribution
    self._table = [self._EMPTY] * self._size
    self._count = 0

    for entry in old_table:
        if entry not in (self._EMPTY, self._TOMBSTONE):
            self.put(entry[0], entry[1])
```
---

## Deletion: The Tombstone Problem

In chaining, deletion is trivial—just remove the node from the linked list. In open addressing, deletion is trickier: if we simply mark a slot as empty, we might accidentally break the probe sequence for other keys, making them unreachable.

The common solution is to use {{< sidenote id="1" label="tombstones" content="Tombstone/delete markers are also used in the context of NoSQL databases that use immutable <a href=\"https://www.scylladb.com/glossary/sstable/\">SSTable</a> structures to signify deletion of data. Later in a compaction operation deleted rows and tombstone markers will be discarded." >}}: a special marker meaning “this slot used to hold something, but it was deleted.” Probe sequences can skip over tombstones while still checking further slots.

Over time, however, tombstones accumulate and reduce performance (they behave like “dead weight” during probing). To reclaim this space, a full rehash—essentially a resize without changing capacity—is sometimes performed.

{{< video webm="hashmap-tombstone.webm" autoplay="true" loop="true" muted="true" >}}

Tombstone markers - which is a lazy approach to deleting items. It however needs one to handle tombstone markers in `get`, `put`, `contains` and `delete`. 

```python
def delete(self, key):
    for i in range(self._size):
        probe_idx = (self._hash(key) + self._probe(key, i)) % self._size
        entry = self._table[probe_idx]

        if entry is self._EMPTY:
            break
        if entry not in (self._EMPTY, self._TOMBSTONE) and entry[0] == key:
            self._table[probe_idx] = self._TOMBSTONE
            self._count -= 1
            return

    raise KeyError(f"Key {key} not found")
```

---

## Performance and Concurrency

One of the main advantages of open addressing is **cache efficiency**. Because all entries live in a single contiguous array, probe sequences tend to exhibit better memory locality than the pointer-heavy structure of chaining. This can make open addressing faster in workloads where cache misses dominate.

However, performance is highly sensitive to the load factor:

- **Average-case complexity**: \\(O(1)\\) for `put`, `get`, and `delete` while the table is sparsely filled.
- **Degradation**: as the load factor approaches capacity, probe chains grow longer, and performance quickly declines.
- **Deletion cost**: tombstones add long-term overhead, occasionally requiring a full rehash.

### Concurrency Considerations

Concurrency is where open addressing struggles:

- **Chaining**: supports fine-grained locking—each bucket can be locked independently. This allows high concurrency without contention.
- **Open addressing**: probe sequences can spill across many slots, making per-slot locking impractical. Most implementations fall back to coarse-grained locks around the entire table.

As a result, open addressing is rarely the best choice for high-concurrency systems. When multiple threads or processes are expected, chaining often wins despite its higher memory overhead.

---

## Use-Cases and Intuition

So, when should you prefer one over the other?

- Chaining is a better fit when:
  + The key distribution is uneven (lots of collisions).
  + Frequent deletions are expected.
  + You need to support parallelism with minimal locking contention.
- Open addressing is a better fit when:
    * Memory locality and cache efficiency are critical.
    * Deletions are infrequent.
    * The table can be kept under ~70% full through regular resizing.

### A Metaphor to Remember

Chaining is like *bins of books* -- you can always toss another book into the right bin, but the bin gets heavier (longer chains) over time.

Open addressing is like *musical chairs* -- if your seat is taken, you keep moving until you find another. As more players join (higher load factor), finding a free chair gets harder.

## Closing Notes

Open addressing is elegant in its simplicity: a hash table that contains everything within a single array, without relying on external structures. This elegance, however, comes with responsibilities. The table must be carefully managed—probes must be designed thoughtfully, load factors must be kept under control, and deletions introduce the subtle complexity of tombstones.

Compared to chaining, open addressing trades away flexibility for **cache-friendly performance and compact memory usage**. When the table is sized appropriately and deletions are infrequent, it can outperform chaining in read-heavy workloads where locality matters. But as load factors creep higher or when concurrency and frequent deletions enter the picture, its weaknesses become clear.

In short: **open addressing shines when memory is tight, access patterns are cache-sensitive, and workloads are mostly insertions and lookups rather than deletions**.

You can find the full implementation of the open addressing based hash map in my [github repo](https://github.com/krispingal/DSA/blob/main/src/dsa/datastructures/open_addressing_hashtable.py).
