package com.north.cdc.dubbo;

import com.alibaba.dubbo.config.ApplicationConfig;
import com.alibaba.dubbo.config.ReferenceConfig;
import com.alibaba.dubbo.rpc.service.GenericService;

public class DubboClient {
    private static final String URL_PREFIX = "dubbo://";
    private static final int TIME_OUT = 10000000;
    public static final int RETRIES = 0;
    private static final ApplicationConfig APPLICATION_CONFIG = new ApplicationConfig("dubbo-client");
    public static <T>  T invoke(DubboRequest dubboRequest,  Class<T> clazz){
        JsonReferenceConfig<GenericService> reference = new JsonReferenceConfig<GenericService>();
        reference.setUrl(URL_PREFIX + dubboRequest.getHost() + ":" + dubboRequest.getPort() + "/" + dubboRequest.getService());
        reference.setInterface(dubboRequest.getHost());
        reference.setGeneric(true);
        reference.setApplication(APPLICATION_CONFIG);
        reference.setTimeout(TIME_OUT);
        reference.setRetries(RETRIES);
        reference.setSerialization("fastjson");
        try{
            //获取服务
            GenericService genericService = reference.get();
            //调用远程类的方法
            Object result =  genericService.$invoke(dubboRequest.getMethod(), dubboRequest.getParamsType(), dubboRequest.getParam());
            System.out.println("result = [" + result + "]");
            return (T)result;
        }catch (Exception e){
            e.printStackTrace();
        }finally {
            reference.destroy();
        }
        return null;
    }


}
