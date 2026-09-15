# Task tree

- root [done] depth=0 sessions=2 tokens=219339 ops=['split', 'deliver'] via=input rect [-150, -150, 150, 150]
  - north-bank [done] depth=1 sessions=2 tokens=184956 ops=['split', 'deliver'] via=split:mixed rect [-150, 28, 150, 150]
    - north-west [done] depth=2 sessions=2 tokens=204612 ops=['split', 'deliver'] via=split:mixed rect [-150, 28, -34, 150]
      - north-west-riverside [done] depth=3 sessions=1 tokens=72248 ops=['deliver'] via=split:mixed rect [-125, 28, -59, 55]
      - north-west-street [done] depth=3 sessions=1 tokens=68991 ops=['deliver'] via=split:mixed rect [-135, 45, -34, 87]
      - north-west-farm [done] depth=3 sessions=1 tokens=80763 ops=['deliver'] via=split:mixed rect [-145, 83, -34, 150]
    - north-east [done] depth=2 sessions=2 tokens=173174 ops=['split', 'deliver'] via=split:mixed rect [-12, 28, 98, 150]
      - north-east-riverside [done] depth=3 sessions=1 tokens=67990 ops=['deliver'] via=split:mixed rect [-12, 28, 44, 56]
      - north-east-roadside [done] depth=3 sessions=1 tokens=73726 ops=['deliver'] via=split:mixed rect [-12, 47, 98, 95]
      - north-east-farm [done] depth=3 sessions=1 tokens=99571 ops=['deliver'] via=split:mixed rect [-12, 91, 98, 150]
    - north-chapel [done] depth=2 sessions=1 tokens=69916 ops=['deliver'] via=split:mixed rect [98, 80, 140, 132]
  - south-bank [done] depth=1 sessions=2 tokens=145408 ops=['split', 'deliver'] via=split:mixed rect [-150, -150, 150, -28]
    - south-west-farms [done] depth=2 sessions=4 tokens=161096 ops=['split', 'split', 'deliver'] via=split:mixed rect [-150, -150, -45, -28]
      - sw-riverside-cottages [done] depth=3 sessions=1 tokens=75676 ops=['deliver'] via=split:mixed rect [-150, -66, -45, -28]
      - sw-orchard-farm [done] depth=3 sessions=1 tokens=73566 ops=['deliver'] via=split:mixed rect [-150, -150, -100, -61]
      - sw-paddock-farm [done] depth=3 sessions=1 tokens=82716 ops=['deliver'] via=split:mixed rect [-100, -150, -45, -54]
    - south-central-farms [done] depth=2 sessions=4 tokens=203688 ops=['split', 'split', 'deliver'] via=split:mixed rect [-45, -150, 38, -28]
      - south-central-west [done] depth=3 sessions=1 tokens=63780 ops=['deliver'] via=split:mixed rect [-45, -150, 4, -55]
      - south-central-east [done] depth=3 sessions=1 tokens=68276 ops=['deliver'] via=split:mixed rect [4, -150, 38, -55]
      - south-central-cottage [done] depth=3 sessions=1 tokens=98835 ops=['deliver'] via=split:mixed rect [-45, -55, 38, -28]
    - south-east-farm [done] depth=2 sessions=2 tokens=51525 ops=['deliver'] via=split:mixed rect [38, -150, 150, -28]
  - crossing-mill [done] depth=1 sessions=2 tokens=196459 ops=['split', 'deliver'] via=split:mixed rect [-34, -64, 81, 42]
    - crossing-mill-bridge [done] depth=2 sessions=2 tokens=54829 ops=['deliver'] via=split:object rect [-32, -39, -12, 40]
    - crossing-mill-mill [done] depth=2 sessions=1 tokens=65174 ops=['deliver'] via=split:object rect [38, -61, 80, -17]
  - waterfront [done] depth=1 sessions=2 tokens=155492 ops=['split', 'deliver'] via=split:mixed rect [-150, -56, 150, 58]
    - waterfront-landings [done] depth=2 sessions=1 tokens=71753 ops=['deliver'] via=split:object rect [-104, -54, 97, 54]
    - waterfront-riparian [done] depth=2 sessions=1 tokens=91338 ops=['deliver'] via=split:object rect [-150, -56, 150, 58]

tasks=27 done=27 merged=0 failed=0 max_depth=3 sessions=42 tokens_M=2.97 peak_concurrency=8 workers=4
splits=9 merges=0 coordination_requests=0 rejections=2 stale_deps=0 overreach=1 foreign_writes=5 blocked=17 stalls=0
wall_min=66 session_time_min=188 worker_utilization=0.71
