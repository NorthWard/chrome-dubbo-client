package com.north.cdc.dubbo;

import com.alibaba.dubbo.config.annotation.Reference;
import com.north.lat.Params;
import com.north.lat.service.SaveTheWorldService;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author laihaohua
 */
@RestController
@Component
public class HelloWorldController {
    @Reference
    private SaveTheWorldService commonSaveTheWorldService;

    private static final String HERO = "laihaohua";

    @RequestMapping("/saveTheWorld")
    public String index(String name) {
        Params params = new Params();
        params.setName(name);
        params.setCount(1);
        return  commonSaveTheWorldService.saveTheWorld(params);
    }
}