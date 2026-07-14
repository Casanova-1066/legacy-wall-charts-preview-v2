import json, os

# UCL Finals 1998/99 - 2023/24: (season_slug, season_name, date, venue,
#   home_code, away_code, home_score, away_score, is_et, is_pen, pen_h, pen_a, winner_code)
UCL_FINALS = [
    ("ucl-1998-99","1998/99","1999-05-26","Camp Nou, Barcelona","MUN","BAY",2,1,True,False,0,0,"MUN"),
    ("ucl-1999-00","1999/00","2000-05-24","Stade de France, Paris","RMA","VAL",3,0,False,False,0,0,"RMA"),
    ("ucl-2000-01","2000/01","2001-05-23","San Siro, Milan","BAY","VAL",1,1,True,True,5,4,"BAY"),
    ("ucl-2001-02","2001/02","2002-05-15","Hampden Park, Glasgow","RMA","LEV",2,1,False,False,0,0,"RMA"),
    ("ucl-2002-03","2002/03","2003-05-28","Old Trafford, Manchester","MIL","JUV",0,0,True,True,3,2,"MIL"),
    ("ucl-2003-04","2003/04","2004-05-26","Arena AufSchalke, Gelsenkirchen","POR","MON",3,0,False,False,0,0,"POR"),
    ("ucl-2004-05","2004/05","2005-05-25","Ataturk Olympic, Istanbul","LIV","MIL",3,3,True,True,3,2,"LIV"),
    ("ucl-2005-06","2005/06","2006-05-17","Stade de France, Paris","BAR","ARS",2,1,False,False,0,0,"BAR"),
    ("ucl-2006-07","2006/07","2007-05-23","Olympic Stadium, Athens","MIL","LIV",2,1,False,False,0,0,"MIL"),
    ("ucl-2007-08","2007/08","2008-05-21","Luzhniki Stadium, Moscow","MUN","CHE",1,1,True,True,6,5,"MUN"),
    ("ucl-2008-09","2008/09","2009-05-27","Stadio Olimpico, Rome","BAR","MUN",2,0,False,False,0,0,"BAR"),
    ("ucl-2009-10","2009/10","2010-05-22","Santiago Bernabeu, Madrid","INT","BAY",2,0,False,False,0,0,"INT"),
    ("ucl-2010-11","2010/11","2011-05-28","Wembley Stadium, London","BAR","MUN",3,1,False,False,0,0,"BAR"),
    ("ucl-2011-12","2011/12","2012-05-19","Allianz Arena, Munich","CHE","BAY",1,1,True,True,4,3,"CHE"),
    ("ucl-2012-13","2012/13","2013-05-25","Wembley Stadium, London","BAY","DOR",2,1,False,False,0,0,"BAY"),
    ("ucl-2013-14","2013/14","2014-05-24","Luzhniki Stadium, Moscow","RMA","ATM",4,1,True,False,0,0,"RMA"),
    ("ucl-2014-15","2014/15","2015-06-06","Olympic Stadium, Berlin","BAR","JUV",3,1,False,False,0,0,"BAR"),
    ("ucl-2015-16","2015/16","2016-05-28","San Siro, Milan","RMA","ATM",1,1,True,True,5,3,"RMA"),
    ("ucl-2016-17","2016/17","2017-06-03","Millennium Stadium, Cardiff","RMA","JUV",3,1,False,False,0,0,"RMA"),
    ("ucl-2017-18","2017/18","2018-05-26","NSC Olimpiyskiy, Kyiv","RMA","LIV",3,1,False,False,0,0,"RMA"),
    ("ucl-2018-19","2018/19","2019-06-01","Wanda Metropolitano, Madrid","LIV","TOT",2,0,False,False,0,0,"LIV"),
    ("ucl-2019-20","2019/20","2020-08-23","Estadio da Luz, Lisbon","BAY","PSG",1,0,False,False,0,0,"BAY"),
    ("ucl-2020-21","2020/21","2021-05-29","Estadio do Dragao, Porto","CHE","MCI",1,0,False,False,0,0,"CHE"),
    ("ucl-2021-22","2021/22","2022-05-28","Stade de France, Paris","RMA","LIV",1,0,False,False,0,0,"RMA"),
    ("ucl-2022-23","2022/23","2023-06-10","Ataturk Olympic, Istanbul","MCI","INT",1,0,False,False,0,0,"MCI"),
    ("ucl-2023-24","2023/24","2024-06-01","Wembley Stadium, London","RMA","DOR",2,0,False,False,0,0,"RMA"),
]

# UCL Semi-Finals (recent seasons where data is reliable): (season_slug, sf1_home, sf1_away, sf2_home, sf2_away)
UCL_SFS = {
    "ucl-2023-24": ("RMA","BAY","DOR","PSG"),
    "ucl-2022-23": ("MCI","RMA","INT","MIL"),
    "ucl-2021-22": ("RMA","MCI","LIV","VIL"),
    "ucl-2020-21": ("CHE","RMA","MCI","PSG"),
    "ucl-2019-20": ("BAY","LYO","PSG","RBL"),
    "ucl-2018-19": ("LIV","BAR","TOT","AJX"),
    "ucl-2017-18": ("RMA","BAY","LIV","ROM"),
    "ucl-2016-17": ("RMA","ATM","JUV","MON"),
    "ucl-2015-16": ("RMA","MCI","ATM","BAY"),
}

# Extra teams needed for UCL (beyond existing 72) — code: (name, short_name, country)
EXTRA_TEAMS = {
    "LEV": ("Bayer Leverkusen","LEV","Germany"),
    "MON": ("Monaco","MON","France"),
    "VAL": ("Valencia","VAL","Spain"),
    "VIL": ("Villarreal","VIL","Spain"),
    "LYO": ("Lyon","LYO","France"),
    "RBL": ("RB Leipzig","RBL","Germany"),
    "AJX": ("Ajax","AJX","Netherlands"),
    "ROM": ("Roma","ROM","Italy"),
    "DOR": ("Borussia Dortmund","DOR","Germany"),
    "ATM": ("Atletico Madrid","ATM","Spain"),
    "PSG": ("Paris Saint-Germain","PSG","France"),
    "MCI": ("Manchester City","MCI","England"),
    "TOT": ("Tottenham Hotspur","TOT","England"),
    "INT": ("Inter Milan","INT","Italy"),
    "POR": ("Porto","POR","Portugal"),
    "JUV": ("Juventus","JUV","Italy"),
    "MIL": ("AC Milan","MIL","Italy"),
    "BAY": ("Bayern Munich","BAY","Germany"),
    "RMA": ("Real Madrid","RMA","Spain"),
    "BAR": ("Barcelona","BAR","Spain"),
    "LIV": ("Liverpool","LIV","England"),
    "MUN": ("Manchester United","MUN","England"),
    "CHE": ("Chelsea","CHE","England"),
    "ARS": ("Arsenal","ARS","England"),
}

COMPETITIONS = [
    {"slug":"ucl","name":"UEFA Champions League","type":"cup","region":"Europe","is_active":True,"featured_order":1,"sort_order":1,"description":"Europe's premier club football competition"},
    {"slug":"facup","name":"FA Cup","type":"cup","region":"England","is_active":True,"featured_order":2,"sort_order":2,"description":"The world's oldest football knockout competition"},
    {"slug":"carabao","name":"Carabao Cup","type":"cup","region":"England","is_active":True,"featured_order":3,"sort_order":3,"description":"English Football League Cup"},
    {"slug":"worldcup","name":"FIFA World Cup","type":"international","region":"Global","is_active":True,"featured_order":4,"sort_order":4,"description":"The pinnacle of international football"},
    {"slug":"euros","name":"UEFA European Championship","type":"international","region":"Europe","is_active":True,"featured_order":5,"sort_order":5,"description":"Europe's international championship"},
    {"slug":"premier-league","name":"Premier League","type":"league","region":"England","is_active":True,"featured_order":6,"sort_order":6,"description":"England's top-flight football league"},
    {"slug":"laliga","name":"La Liga","type":"league","region":"Spain","is_active":True,"featured_order":7,"sort_order":7,"description":"Spain's top-flight football league"},
]

ROUND_DEFS = [
    {"name":"Group Stage","slug":"group-stage","round_type":"group","sort_order":1,"num_teams":32},
    {"name":"Round of 16","slug":"round-of-16","round_type":"knockout","sort_order":2,"num_teams":16},
    {"name":"Quarter-Finals","slug":"quarter-finals","round_type":"knockout","sort_order":3,"num_teams":8},
    {"name":"Semi-Finals","slug":"semi-finals","round_type":"knockout","sort_order":4,"num_teams":4},
    {"name":"Final","slug":"final","round_type":"knockout","sort_order":5,"num_teams":2},
]

# Load existing seed to preserve themes + admin_settings + teams
existing = {}
if os.path.exists("neon/seed.json"):
    existing = json.load(open("neon/seed.json", encoding="utf-8"))

# Build teams list: existing + extra
teams = existing.get("teams", [])
existing_codes = {t["code"] for t in teams}
for code, (name, short, country) in EXTRA_TEAMS.items():
    if code not in existing_codes:
        teams.append({"code": code, "name": name, "short_name": short,
                       "slug": code.lower(), "country": country})
        existing_codes.add(code)

seasons = []
rounds = []
fixtures = []
official_results = []

for i, fin in enumerate(UCL_FINALS):
    s_slug, s_name, date, venue, hc, ac, hs, as_, et, pen, ph, pa, winner = fin
    seasons.append({
        "slug": s_slug, "competition_slug": "ucl", "name": s_name,
        "is_current": (i == len(UCL_FINALS)-1), "is_complete": True,
        "sort_order": len(UCL_FINALS) - i,
    })
    for rd in ROUND_DEFS:
        rounds.append({
            "season_slug": s_slug, "competition_slug": "ucl",
            "name": rd["name"], "slug": rd["slug"],
            "round_type": rd["round_type"], "sort_order": rd["sort_order"],
            "num_teams": rd["num_teams"],
        })

    # Final fixture (bracket_position 0 within the Final round)
    fkey = f"{s_slug}|final|{hc}-{ac}|1"
    fixtures.append({
        "key": fkey, "season_slug": s_slug, "round_slug": "final",
        "competition_slug": "ucl", "home_team_code": hc, "away_team_code": ac,
        "bracket_position": 0, "leg": 1, "scheduled_date": date,
        "venue": venue, "sort_order": 0,
    })
    official_results.append({
        "fixture_key": fkey, "home_score": hs, "away_score": as_,
        "status": "completed", "winner_team_code": winner,
        "is_extra_time": et, "is_penalties": pen,
        "penalties_home": ph or None, "penalties_away": pa or None,
        "source": "documented", "verified": True,
    })

    # Semi-Final fixtures (if we have the data)
    if s_slug in UCL_SFS:
        sf1h, sf1a, sf2h, sf2a = UCL_SFS[s_slug]
        for bp, (h, a) in enumerate([(sf1h,sf1a),(sf2h,sf2a)]):
            for leg in (1,2):
                fkey = f"{s_slug}|semi-finals|{h}-{a}|{leg}"
                fixtures.append({
                    "key": fkey, "season_slug": s_slug, "round_slug": "semi-finals",
                    "competition_slug": "ucl", "home_team_code": h, "away_team_code": a,
                    "bracket_position": bp, "leg": leg, "sort_order": bp*2+leg-1,
                })
                official_results.append({
                    "fixture_key": fkey, "home_score": None, "away_score": None,
                    "status": "scheduled", "source": "documented", "verified": True,
                })

    # R16 + QF structure (TBD slots so bracket renders)
    for bp in range(8):
        fkey = f"{s_slug}|round-of-16|slot-{bp}|1"
        fixtures.append({"key": fkey, "season_slug": s_slug, "round_slug": "round-of-16",
            "competition_slug": "ucl", "bracket_position": bp, "leg": 1, "sort_order": bp})
    for bp in range(4):
        fkey = f"{s_slug}|quarter-finals|slot-{bp}|1"
        fixtures.append({"key": fkey, "season_slug": s_slug, "round_slug": "quarter-finals",
            "competition_slug": "ucl", "bracket_position": bp, "leg": 1, "sort_order": bp})

seed = {
    "competitions": COMPETITIONS,
    "teams": teams,
    "seasons": seasons,
    "rounds": rounds,
    "fixtures": fixtures,
    "official_results": official_results,
    "themes": existing.get("themes", []),
    "admin_settings": existing.get("admin_settings", []),
}
json.dump(seed, open("neon/seed.json","w",encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"competitions={len(seed['competitions'])} teams={len(seed['teams'])} seasons={len(seed['seasons'])} rounds={len(seed['rounds'])} fixtures={len(seed['fixtures'])} results={len(seed['official_results'])} themes={len(seed['themes'])} admin={len(seed['admin_settings'])}")
