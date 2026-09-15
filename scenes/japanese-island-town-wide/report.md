# Task tree

- root [done] depth=0 sessions=4 tokens=870625 ops=['split', 'deliver', 'reopen', 'deliver'] via=input rect [-150, -150, 150, 150]
  - west-village [done] depth=1 sessions=2 tokens=183999 ops=['deliver', 'deliver'] via=split:mixed rect [-66, -58, -35, 31]
  - central-village [done] depth=1 sessions=4 tokens=627236 ops=['split', 'deliver', 'reopen', 'deliver'] via=split:mixed rect [-34, -58, -2, 31]
    - central-village-south [done] depth=2 sessions=1 tokens=105294 ops=['deliver'] via=split:object rect [-34, -55, -2, -41]
    - central-village-market [done] depth=2 sessions=2 tokens=220395 ops=['deliver', 'deliver'] via=split:object rect [-34, -39, -2, -27]
    - central-village-tea [done] depth=2 sessions=2 tokens=231661 ops=['deliver', 'deliver'] via=split:object rect [-34, -16, -2, -4]
    - central-village-gardens [done] depth=2 sessions=1 tokens=81582 ops=['deliver'] via=split:object rect [-34, 0, -2, 12]
    - central-village-north [done] depth=2 sessions=1 tokens=96678 ops=['deliver'] via=split:object rect [-34, 16, -2, 29]
  - east-village [done] depth=1 sessions=3 tokens=252020 ops=['split', 'deliver', 'deliver'] via=split:mixed rect [-1, -58, 33, 30]
    - east-village-shore [done] depth=2 sessions=1 tokens=85351 ops=['deliver'] via=split:object rect [-1, -58, 33, -40]
    - east-village-nets [done] depth=2 sessions=1 tokens=70876 ops=['deliver'] via=split:object rect [-1, -40, 33, -25]
    - east-village-gardens [done] depth=2 sessions=1 tokens=101727 ops=['deliver'] via=split:object rect [-1, -21, 33, -2]
    - east-village-laundry [done] depth=2 sessions=1 tokens=100143 ops=['deliver'] via=split:object rect [-1, -2, 33, 14]
    - east-village-upper [done] depth=2 sessions=1 tokens=101463 ops=['deliver'] via=split:object rect [-1, 14, 33, 28]
  - temple [done] depth=1 sessions=3 tokens=309273 ops=['split', 'deliver', 'deliver'] via=split:mixed rect [-22, 35, 34, 77]
    - temple-pagoda [done] depth=2 sessions=1 tokens=79816 ops=['deliver'] via=split:object rect [15, 48, 31, 64]
    - temple-hall [done] depth=2 sessions=1 tokens=103735 ops=['deliver'] via=split:object rect [-11, 47, 13, 66]
  - harbor [done] depth=1 sessions=3 tokens=326692 ops=['split', 'deliver', 'deliver'] via=split:mixed rect [49, -90, 95, -29]
    - harbor-fleet [done] depth=2 sessions=1 tokens=89164 ops=['deliver'] via=split:object rect [54, -78, 90, -64]
    - harbor-shoreworks [done] depth=2 sessions=1 tokens=123989 ops=['deliver'] via=split:object rect [50, -59, 93, -38]
  - rice-terraces [done] depth=1 sessions=3 tokens=276633 ops=['split', 'deliver', 'deliver'] via=split:mixed rect [-96, -19, -66, 62]
    - rice-storage [done] depth=2 sessions=1 tokens=70551 ops=['deliver'] via=split:object rect [-95, -19, -80, -7]
    - rice-garden [done] depth=2 sessions=1 tokens=87425 ops=['deliver'] via=split:object rect [-73, 53, -66, 61]
  - shore-shrine [done] depth=1 sessions=3 tokens=336213 ops=['split', 'deliver', 'deliver'] via=split:mixed rect [-94, -79, -63, -42]
    - shore-shrine-sanctuary [done] depth=2 sessions=1 tokens=97787 ops=['deliver'] via=split:object rect [-82, -55, -72, -44]
    - shore-shrine-coast [done] depth=2 sessions=1 tokens=107021 ops=['deliver'] via=split:object rect [-94, -79, -63, -42]
  - stream-garden [done] depth=1 sessions=4 tokens=585751 ops=['split', 'deliver', 'deliver', 'deliver'] via=split:mixed rect [30, -85, 61, 64]
    - spring-bank [done] depth=2 sessions=1 tokens=96140 ops=['deliver'] via=split:axis rect [34, 36, 56, 64]
    - middle-bank [done] depth=2 sessions=1 tokens=74743 ops=['deliver'] via=split:axis rect [30, -19, 56, 27]
    - estuary-bank [done] depth=2 sessions=1 tokens=63276 ops=['deliver'] via=split:axis rect [30, -84, 49, -30]
  - woodland [done] depth=1 sessions=1 tokens=78566 ops=['deliver'] via=split:mixed objects ['root_woodland_reserve']

tasks=31 done=31 merged=0 failed=0 max_depth=2 sessions=53 tokens_M=6.04 peak_concurrency=10 workers=10
splits=8 merges=0 coordination_requests=0 rejections=0 stale_deps=0 overreach=0 foreign_writes=0 blocked=4 stalls=0
leaf_depth_by_area={0: 0.748, 1: 0.1, 2: 0.152}  map=/data/zhiqi/SACW-runs/japanese-towns-deep7/runs/japanese-towns/tasks/depth-map.png
wall_min=80 session_time_min=359 worker_utilization=0.45
