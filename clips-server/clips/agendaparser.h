#ifndef CLIPSLIB_AGENDAPARSER_H
#define CLIPSLIB_AGENDAPARSER_H

#include <string>
#include <vector>

#include "factparser.h"

namespace clipslib {
    class AgendaParser {
        protected:
            struct item {
                std::string name;
                std::vector<int> facts;
            };

        public:
            AgendaParser();
            AgendaParser(std::string& str);

            void parseString(std::string& str);
            item getItem(int index);

            std::string withFacts(FactParser &fp);

            std::string toString();
        protected:
            std::vector<item> items;

            std::string getItemNameFromRawLine(char* line);
            std::vector<int> getFactsFromRawLine(char* line);
    };
}

#endif  // CLIPSLIB_AGENDAPARSER_H