#include <node.h>
// #include <json.hpp>
#include <string>
#include <sstream>
#include <vector>
#include <iostream>
#include <cstring>
#include <cstdio>

#include "clips/clips.h"

#include "agendaparser.h"
#include "factparser.h"
#include "stringbuffer.h"

namespace clipslib {

    using v8::Local;
    using v8::Object;
    using v8::FunctionCallbackInfo;
    using v8::Value;
    using v8::Isolate;

    void assertState(void* env, std::string &state);
    std::vector<std::string> &split(const std::string &s, char delim, std::vector<std::string> &elems);
    std::vector<std::string> split(const std::string &s, char delim);
    void getFactListAsString(void *env, std::string &str);
    void getAgendaAsString(void *env, std::string &str);

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
    }

    void generateActions(const FunctionCallbackInfo<Value>& args) {
        Isolate *isolate = args.GetIsolate();

        void* env = CreateEnvironment();
        EnvLoad(env, "actions.clips");
        EnvReset(env);

        v8::String::Utf8Value attrs(args[0]->ToString());
        std::string state(*attrs);
        assertState(env, state);

        std::string facts;
        getFactListAsString(env, facts);
        FactParser fp;
        fp.parseString(facts);

        std::string agenda;
        getAgendaAsString(env, agenda);
        AgendaParser ap;
        ap.parseString(agenda);

        // std::cout << ap.withFacts(fp) << std::endl;

        std::string str = ap.withFacts(fp);
        args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, ap.withFacts(fp).c_str()));

    }

    void Init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "runSimulation", runSimulation);
        NODE_SET_METHOD(exports, "generateActions", generateActions);
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

    void getFactListAsString(void *env, std::string &str) {
        stringbuffer::bufferOn(env);
        EnvFacts(env, stringbuffer::WBUFFER, NULL, -1, -1, -1);
        str.assign(stringbuffer::getBufferValue());
        stringbuffer::bufferOff(env);
    }

    void getAgendaAsString(void *env, std::string &str) {
        stringbuffer::bufferOn(env);
        EnvAgenda(env, stringbuffer::WBUFFER, NULL);
        str.assign(stringbuffer::getBufferValue());
        stringbuffer::bufferOff(env);
    }
}