package com.north.cdc.dubbo;


public class DubboTest {
    public static void main(String[] args) {

        DubboRequest dubboRequest = new DubboRequest();
        dubboRequest.setHost("localhost");
        dubboRequest.setMethod("test");
        dubboRequest.setPort(20881);
        dubboRequest.setParamsType(new String[]{"java.lang.String"});
        dubboRequest.setParam(new Object[]{"haha"});
        dubboRequest.setService("com.north.spilat.service.DubboDemoService");
        String s = DubboClient.invoke(dubboRequest, String.class);
        System.out.println(s);
    }
}
