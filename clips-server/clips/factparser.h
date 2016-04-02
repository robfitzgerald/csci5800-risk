#ifndef CLIPSLIB_FACTPARSER_H
#define CLIPSLIB_FACTPARSER_H

#include <string>
#include <unordered_map>

namespace clipslib {
    class FactParser {
        public:
            FactParser();
            FactParser(std::string& str);

            void parseString(std::string& str);
            std::string getFact(int index);
        protected:
            std::unordered_map<int, std::string> map;

            int getFactIndexFromRawLine(char* fact);
            std::string getFactFromRawLine(char* fact);
    };
}

#endif  // CLIPSLIB_FACTPARSER_H