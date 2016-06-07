#include <node.h>
#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <cstring>
#include <cstdio>

#include "clips/clips.h"

namespace clipslib {

    using v8::Local;
    using v8::Object;
    using v8::FunctionCallbackInfo;
    using v8::Value;
    using v8::Isolate;

    void assertState(void* env, std::string &state);
    std::vector<std::string> &split(const std::string &s, char delim, std::vector<std::string> &elems);
    std::vector<std::string> split(const std::string &s, char delim);

    void runSimulation(const FunctionCallbackInfo<Value>& args) {
        void* env = CreateEnvironment();
        EnvLoad(env, "sim.clips");

        EnvReset(env);

        v8::String::Utf8Value attrs(args[0]->ToString());
        std::string state(*attrs);
        assertState(env, state);

        EnvSetStrategy(env, RANDOM_STRATEGY);

        EnvRun(env, -1);

        char* global = new char[100];
        EnvGetDefglobalValueForm(env, global, static_cast<size_t>(100), EnvFindDefglobal(env, "result"));
        
        std::string str(global);
        str = split(global, ' ')[2];
        int i;
        sscanf(str.c_str(), "%d", &i);
        args.GetReturnValue().Set(i);

        delete global;
        global = nullptr;

        DestroyEnvironment(env);
        env = nullptr;
    }

    void Init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "runSimulation", runSimulation);
    }

    NODE_MODULE(clipslib, Init)

    std::vector<std::string> &split(const std::string &s, char delim, std::vector<std::string> &elems) {
        std::stringstream ss(s);
        std::string item;
        while (std::getline(ss, item, delim)) {
            elems.push_back(item);
        }
        return elems;
    }


    std::vector<std::string> split(const std::string &s, char delim) {
        std::vector<std::string> elems;
        split(s, delim, elems);
        return elems;
    }

    void assertState(void* env, std::string &state) {
        std::vector<std::string> asserts = split(state, ',');

        for (std::vector<std::string>::iterator it = asserts.begin(); it != asserts.end(); ++it) {
            EnvAssertString(env, (*it).c_str());
        }
    }
}