package ma.cimr.affiliation.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import ma.cimr.affiliation.model.Affilie;

@Data
@EqualsAndHashCode(callSuper = true)
public class CreateAffilieRequest extends Affilie {
    private String username;
    private String password;
}
