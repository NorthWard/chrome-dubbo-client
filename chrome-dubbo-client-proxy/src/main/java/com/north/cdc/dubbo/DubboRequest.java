package com.north.cdc.dubbo;

public class DubboRequest  {
    private String host;
    private int port;
    private String service;
    private String method;
    private String [] paramsType;
    private Object [] param;

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String[] getParamsType() {
        return paramsType;
    }

    public void setParamsType(String[] paramsType) {
        this.paramsType = paramsType;
    }

    public Object[] getParam() {
        return param;
    }

    public void setParam(Object[] param) {
        this.param = param;
    }
}
