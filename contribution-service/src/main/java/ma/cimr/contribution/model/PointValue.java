package ma.cimr.contribution.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Entity
@Table(name = "point_values")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointValue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "year", nullable = false, unique = true)
    private Integer year;

    @Column(name = "value", nullable = false)
    private BigDecimal value;
}