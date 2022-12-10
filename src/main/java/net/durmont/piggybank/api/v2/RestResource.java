package net.durmont.piggybank.api.v2;

import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;

import java.util.List;

public abstract class RestResource {

    protected Sort buildSort(List<String> sortQuery) {
        Sort sort = Sort.empty();
        if (sortQuery != null) {
            for (String sortParam : sortQuery) {
                if (sortParam.startsWith("-"))
                    sort = sort.and(sortParam.substring(1), Sort.Direction.Descending);
                else
                    sort = sort.and(sortParam);
            }
        }
        return sort;
    }

    protected Page buildPage(int pageIndex, int pageSize) {
        return pageSize > 0 ? Page.of(pageIndex, pageSize) : null;
    }
}
