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
            "-fno-exceptions",
<<<<<<< HEAD
	    "-std=c++11"
=======
            "-std=c++11"
>>>>>>> develop
        ],
        "cflags_cc!": [
            "-fno-exceptions",
	    "-std=c++11" 
       ]
    }
  ]
}

