#include "agendaparser.h"

#include <cstring>
#include <string>
#include <sstream>
#include <iostream>

namespace clipslib {
    AgendaParser::AgendaParser() {

    }

    AgendaParser::AgendaParser(std::string& str) {
        this->parseString(str);
    }

    void AgendaParser::parseString(std::string& str) {
        std::stringstream stream(str);

        char line[256];
        while ((stream.getline(line, 256)).good()) {
            if (line[0] == ' ') {
                std::string name = this->getItemNameFromRawLine(line);
                std::vector<int> facts = this->getFactsFromRawLine(line);

                item new_item;
                new_item.name = name;
                new_item.facts = facts;

                this->items.push_back(new_item);
            }
        }
    }

    AgendaParser::item AgendaParser::getItem(int index) {
        return this->items[index];
    }

    std::string AgendaParser::getItemNameFromRawLine(char* line) {
        int start = std::strcspn(line, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
        int end = std::strcspn(line, ":");

        char result_c[256];
        std::strncpy(result_c, &(line[start]), end-start);
        result_c[end-start] = '\0';

        std::string result(result_c);
        return result;
    }

    std::vector<int> AgendaParser::getFactsFromRawLine(char* line) {
        std::vector<int> result;

        char facts[256];
        std::strcpy(facts, &(line[std::strcspn(line, ":")+1]));

        while (strcmp(facts, "") != 0 && (facts[0] == ' ' || facts[0] == ',')) {
            // Strip off leading data
            char new_facts[256];
            std::strcpy(new_facts, &(facts[3]));

            int end = std::strcspn(new_facts, ",");
            char num_c[5];
            std::strncpy(num_c, new_facts, end);
            std::strcpy(facts, &(new_facts[end]));

            result.push_back(std::stoi(num_c));
        }

        return result;
    }

    std::string AgendaParser::withFacts(FactParser &fp) {
        std::stringstream result;

        for (std::vector<item>::iterator it = this->items.begin(); it != this->items.end(); ++it) {
            result << it->name << ":\n";
            for (std::vector<int>::iterator jt = it->facts.begin(); jt != it->facts.end(); ++jt) {
                result << "    " << fp.getFact(*jt) << "\n";
            }

            result << "\n";
        }

        return result.str();
    }

    std::string AgendaParser::toString() {
        std::stringstream result;

        for (std::vector<item>::iterator it = this->items.begin(); it != this->items.end(); ++it) {
            result << it->name << ": ";
            for (std::vector<int>::iterator jt = it->facts.begin(); jt != it->facts.end(); ++jt) {
                result << " " << *jt;
            }

            result << "\n";
        }

        return result.str();
    }
}