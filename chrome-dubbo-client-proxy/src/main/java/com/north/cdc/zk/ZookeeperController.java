package com.north.cdc.zk;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import org.I0Itec.zkclient.ZkClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.UnsupportedEncodingException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.net.URLDecoder;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/zk")
public class ZookeeperController {

    public static final String SPILT = "/";
    public static final String DUBBO_PREFFIX = SPILT + "dubbo";
    public static final String PROVIDERS = "providers";

    @RequestMapping("getZkServiceList")
    public List<String> getServiceNameList(final String hostAndPort, final String key) {
        try{
            ZkClient client = new ZkClient(hostAndPort, 5000);
            List<String> list = client.getChildren(DUBBO_PREFFIX);
            if(key != null && list != null){
                list = list.stream().filter((name)-> name.contains(key)).collect(Collectors.toList());
            }
            return  list;
        }catch(Exception e){
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    @RequestMapping("getServiceAddress")
    public List<String> getServiceAddress(final String hostAndPort, final String serviceName) {
        try{
            ZkClient client = new ZkClient(hostAndPort, 5000);
            List<String> list = client.getChildren(DUBBO_PREFFIX + SPILT + serviceName +  SPILT +  PROVIDERS);
            return list.stream().map(s -> {
                try {
                    s  =  URLDecoder.decode(s , "utf8");
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                }
                return s;
            }).collect(Collectors.toList());
        }catch(Exception e){
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    @RequestMapping("getServiceMethodParmTemplate")
    public String getServiceMethodParmTemplate(final String clazz, final String method) {
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        try {
           Class c = classLoader.loadClass(clazz);
           List<Method> ml = Arrays.stream(c.getDeclaredMethods()).filter(method1 -> {return method1.getName().equalsIgnoreCase(method);}).collect(Collectors.toList());
           Class<?> [] param = ml.get(0).getParameterTypes();
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        return "";
    }
    public static Gson gson = new GsonBuilder().enableComplexMapKeySerialization().serializeNulls().setPrettyPrinting().create();

    private static final HashMap<Class<?>, Object> WRAPPER_TYPES = getWrapperTypes();

    private static HashMap<Class<?>, Object> getWrapperTypes()
    {
        HashMap<Class<?>, Object> ret = new HashMap<>(8);
        ret.put(Boolean.class, false);
        ret.put(Character.class,"");
        ret.put(Byte.class, "");
        ret.put(Short.class, 1);
        ret.put(Integer.class,1);
        ret.put(Long.class, 1);
        ret.put(Float.class,1.0);
        ret.put(Double.class,1.0);
        ret.put(Void.class,"");
        ret.put(String.class, "");
        return ret;
    }
    private static String getJsonTemplate( Class clazz ){
        if(clazz == null){
            throw  new NullPointerException();
        }
        if(WRAPPER_TYPES.containsKey(clazz)){
            return WRAPPER_TYPES.get(clazz).toString();
        }
        Field[] fields = clazz.getDeclaredFields();
        StringBuffer sb = new StringBuffer();
        for(Field field : fields){
             String name = field.getName();
            String v = "";
            try {
                Type t = field.getGenericType();
                if(WRAPPER_TYPES.containsKey(t)){
                    v = WRAPPER_TYPES.get(t).toString();
                }else if(Map.class.isAssignableFrom(field.getType())){
                    v = "{}";
                }else if(Collection.class.isAssignableFrom(field.getType())){
                    v = "[]";
                    if (ParameterizedType.class.isAssignableFrom(t.getClass())) {
                        ParameterizedType parameterizedType = (ParameterizedType)t;
                        if(parameterizedType.getActualTypeArguments() != null && parameterizedType.getActualTypeArguments().length > 0){
                            Type paramType = ((ParameterizedType) t).getActualTypeArguments()[0];
                            v = "{" + getJsonTemplate(Class.forName(paramType.getTypeName())) +"}";
                        }
                      }
                }else if(Number.class.isAssignableFrom(field.getType())){
                   v = "0";
                } else{
                   v = getJsonTemplate(t.getClass());
                }
                String s = name + ": " + v;
                sb.append(s).append(",");
            }catch (Exception E){
                E.printStackTrace();
            }
        }
        return sb.toString();
    }


}
