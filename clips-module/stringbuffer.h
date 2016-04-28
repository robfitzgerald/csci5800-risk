#include "clips/clips.h"
#include <stdio.h>
#include <cstring>
#include <string>
#include <sstream>

namespace clipslib {
    namespace stringbuffer {

        const char* WBUFFER = "string_buffer";

        std::stringstream buffer;

        std::string getBufferValue() {
            return buffer.str();
        }

        int findBuffer(void* env, const char* name) {
            if (std::strcmp(name, WBUFFER) == 0)
                return 1;

            return 0;
        }

        int printBuffer(void* env, const char* name, const char* str) {
            buffer << str;
            return 0;
        }

        int exitBuffer(void* env, int exitCode) {
            buffer.str("");
            return 0;
        }

        int bufferOn(void* env) {
            EnvAddRouter(env, WBUFFER, 20, findBuffer, printBuffer, NULL, NULL, exitBuffer);

            return 1;
        }

        int bufferOff(void* env) {
            EnvDeleteRouter(env, WBUFFER);
            exitBuffer(env, 0);

            return 1;
        }
    }
}
