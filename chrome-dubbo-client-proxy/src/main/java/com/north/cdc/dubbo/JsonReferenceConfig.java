package com.north.cdc.dubbo;

import com.alibaba.dubbo.config.ReferenceConfig;

public class JsonReferenceConfig<T> extends ReferenceConfig<T> {
    private String serialization;

    public String getSerialization() {
        return serialization;
    }

    public void setSerialization(String serialization) {
        this.serialization = serialization;
    }
}
