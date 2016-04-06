{
  "targets": [
    {
        "target_name": "clipslib",
        "sources": [
            "factparser.cpp",
            "agendaparser.cpp",
            "clips.cpp"
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

