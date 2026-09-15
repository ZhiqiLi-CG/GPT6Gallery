# Task tree

- root [done] depth=0 sessions=3 tokens=371517 ops=['split', 'resolve', 'deliver'] via=input rect [-150, -150, 150, 150]
  - town [done] depth=1 sessions=2 tokens=222809 ops=['coordinate', 'deliver'] via=split:mixed rect [-95, -76, 29, 37]
  - sacred [done] depth=1 sessions=1 tokens=55525 ops=['deliver'] via=split:mixed rect [-79, -94, -15, 85]
  - harbor [done] depth=1 sessions=1 tokens=66033 ops=['deliver'] via=split:mixed rect [47, -113, 110, -42]
  - rural [done] depth=1 sessions=1 tokens=58753 ops=['deliver'] via=split:mixed rect [-140, -120, 140, 125]

tasks=5 done=5 merged=0 failed=0 max_depth=1 sessions=8 tokens_M=0.77 peak_concurrency=4 workers=10
splits=1 merges=0 coordination_requests=1 rejections=0 stale_deps=0 overreach=0 foreign_writes=0 blocked=0 stalls=0
wall_min=27 session_time_min=47 worker_utilization=0.17
coordination_wait_s: mean=85 max=85 n=1
