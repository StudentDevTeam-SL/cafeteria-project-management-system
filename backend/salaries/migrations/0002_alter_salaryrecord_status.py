from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('salaries', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salaryrecord',
            name='status',
            field=models.CharField(
                choices=[
                    ('paid', 'Paid'),
                    ('pending', 'Pending'),
                    ('processing', 'Processing'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
