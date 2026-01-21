curl http://localhost:3000/pragmatic-papers \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "volumeNumber": 1,
    "articles": [
      {"name": "Getting Away With It", "slug": "getting-away-with-it"},
      {"name": "2016 Russian Interference Timeline", "slug": "2016-russian-interference-timeline"},
      {"name": "America’s White Power Movement (1975–1995)", "slug": "america-s-white-power-movement-19751995"},
      {"name": "The Venezuelan Response", "slug": "the-venezuelan-response"},
      {"name": "Executive Order Monthly Report - November", "slug": "executive-order-monthly-report---november"},
      {"name": "DGG Political Action Award - November Winner", "slug": "dgg-political-action-award---november-winner"}
    ]
  }'