{
  "targets": [
    {
        "target_name": "clipslib",
        "sources": [
            "clips/factparser.cpp",
            "clips/agendaparser.cpp",
            "clips/clips.cpp"
        ],
        "include_dirs": [],
        "link_settings": {
            "libraries": [
                "/usr/local/lib/libclips++.a",
                "-lclips"
            ]
        },
        "cflags!" : [
            "-fno-exceptions"
        ],
        "cflags_cc!": [
            "-fno-exceptions"
        ]
    }
  ]
}

