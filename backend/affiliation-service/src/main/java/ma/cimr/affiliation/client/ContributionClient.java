package ma.cimr.affiliation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@FeignClient(name = "contribution-service", url = "${application.config.contribution-url:http://contribution-service:8082/api/contributions}")
public interface ContributionClient {

    @GetMapping("/history/{affilieId}")
    List<Map<String, Object>> getContributionsByAffilie(@PathVariable("affilieId") UUID affilieId);

    @GetMapping("/points/{affilieId}")
    Map<String, Object> getPointsByAffilie(@PathVariable("affilieId") UUID affilieId);
}
