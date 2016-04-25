#include <sstream>
#include <cstring>
#include <cstdio>

#include "factparser.h"

namespace clipslib {
    FactParser::FactParser() {}

    FactParser::FactParser(std::string& str) {
        this->parseString(str);
    }

    void FactParser::parseString(std::string& str) {
        std::stringstream stream(str);

        char line[256];
        while ((stream.getline(line, 256)).good()) {
            // Check if the line is a fact
            if (line[0] == 'f' && line[1] == '-') {
                int index = this->getFactIndexFromRawLine(line);
                std::string fact = this->getFactFromRawLine(line);

                this->map[index] = fact;
            }
        }
    }

    std::string FactParser::getFact(int index) {
        return this->map[index];
    }

    int FactParser::getFactIndexFromRawLine(char* fact) {
        int index_length = std::strcspn(fact, " ");
        char index[index_length - 1];
        for (int i = 0; i < index_length - 2; ++i) {
            index[i] = fact[i+2];
        }

        index[index_length - 2] = '\0';

        int i;
        //return std::stoi(index);
        sscanf(index, "%d", &i);
        return i;
    }

    std::string FactParser::getFactFromRawLine(char* fact) {
        int start = std::strcspn(fact, "(");
        char cstr[256];
        std::strcpy(cstr, &(fact[start]));

        std::string result(cstr);

        return result;
    }

}

