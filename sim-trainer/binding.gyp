{
  "targets": [
    {
        "target_name": "clipslib",
        "sources": [
            "clips.cpp"
        ],
        "include_dirs": [],
        "link_settings": {
            "libraries": [
                "/usr/local/lib/libclips++.a"
            ]
        },
        "cflags!" : [
            "-fno-exceptions",
        ],
        "cflags_cc!": [
            "-fno-exceptions"
       ]
    }
  ]
}

