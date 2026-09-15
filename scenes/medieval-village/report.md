# Task tree

- root [done] depth=0 sessions=2 tokens=204593 ops=['split', 'deliver'] via=input rect [-150, -150, 150, 150]
  - village [done] depth=1 sessions=1 tokens=95236 ops=['deliver'] via=split:object rect [-94, -57, 31, 45]
  - landmarks [done] depth=1 sessions=1 tokens=53558 ops=['deliver'] via=split:object rect [-122, 39, -10, 113]
  - farms [done] depth=1 sessions=1 tokens=82218 ops=['deliver'] via=split:object objects ['root_farm_west_zone', 'root_farm_east_zone']

tasks=4 done=4 merged=0 failed=0 max_depth=1 sessions=5 tokens_M=0.44 peak_concurrency=3 workers=10
splits=1 merges=0 coordination_requests=0 rejections=0 stale_deps=0 overreach=0 foreign_writes=0 blocked=0 stalls=0
wall_min=24 session_time_min=40 worker_utilization=0.16
