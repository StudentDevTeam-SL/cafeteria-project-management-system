from django.db import models
from employees.models import Employee

class SalaryRecord(models.Model):
    STATUS_CHOICES = (
        ('paid', 'Paid'),
        ('pending', 'Pending'),
        ('processing', 'Processing'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='salaries')
    base_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    net_salary = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)

    def save(self, *args, **kwargs):
        from decimal import Decimal
        self.base_salary = Decimal(str(self.base_salary))
        self.bonus = Decimal(str(self.bonus))
        self.deduction = Decimal(str(self.deduction))
        self.net_salary = self.base_salary + self.bonus - self.deduction
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.full_name} - Net: {self.net_salary} - {self.status}"
